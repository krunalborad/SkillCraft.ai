import { createServerFn } from "@tanstack/react-start";
import { callGeminiWithFallback, friendlyGeminiMessage, GeminiError } from "@/lib/gemini-retry";
 
type ChatBody = Record<string, unknown>;
 
type OpenAIMessage = { role: string; content: string };
type ToolFunction = {
  type: "function";
  function: { name: string; description: string; parameters: Record<string, unknown> };
};
 
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
 
// Per-request timeout so a slow or hung provider never blocks for a minute.
const TIMEOUT_MS = 25000;
 
// Gemini models, tried in order. The first can be overridden with GEMINI_MODEL.
const FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
 
/* ------------------------------------------------------------------ */
/* Gemini                                                              */
/* ------------------------------------------------------------------ */
 
// Gemini's responseSchema doesn't understand "additionalProperties", and it
// requires "type" values in UPPERCASE (OBJECT, STRING, ARRAY, INTEGER, BOOLEAN)
// rather than the lowercase OpenAI-style ("object", "string") used by tool().
function sanitizeSchemaForGemini(schema: unknown): unknown {
  if (Array.isArray(schema)) {
    return schema.map(sanitizeSchemaForGemini);
  }
  if (schema && typeof schema === "object") {
    const clone: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(schema as Record<string, unknown>)) {
      if (key === "additionalProperties") continue;
      if (key === "type" && typeof value === "string") {
        clone[key] = value.toUpperCase();
        continue;
      }
      clone[key] = sanitizeSchemaForGemini(value);
    }
    return clone;
  }
  return schema;
}
 
async function callGemini(body: ChatBody) {
  const key = process.env["GEMINI_API_KEY"];
  if (!key) throw new Error("Gemini is not configured");
 
  const primaryModel = process.env["GEMINI_MODEL"] || "gemini-2.5-flash";
  const models = [primaryModel, ...FALLBACK_MODELS.filter((m) => m !== primaryModel)];
 
  const messages = (body.messages as OpenAIMessage[]) ?? [];
  const systemMessage = messages.find((m) => m.role === "system")?.content ?? "";
  const userMessage = messages
    .filter((m) => m.role !== "system")
    .map((m) => m.content)
    .join("\n\n");
 
  const tools = body.tools as ToolFunction[] | undefined;
  const schema = tools?.[0]?.function?.parameters;
 
  const generationConfig: Record<string, unknown> = {
    temperature: 0.6,
    // Interview scoring returns a model answer for every question, so this
    // needs to be large or the JSON gets cut off and fails to parse.
    maxOutputTokens: 8192,
  };
  if (schema) {
    generationConfig.responseMimeType = "application/json";
    generationConfig.responseSchema = sanitizeSchemaForGemini(schema);
  }
 
  const requestBody = JSON.stringify({
    systemInstruction: systemMessage ? { parts: [{ text: systemMessage }] } : undefined,
    contents: [{ role: "user", parts: [{ text: userMessage }] }],
    generationConfig,
  });
 
  let res: Response;
  try {
    res = await callGeminiWithFallback(models, (model) =>
      fetch(`${GEMINI_BASE}/${model}:generateContent`, {
        method: "POST",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: requestBody,
      }),
    );
  } catch (err) {
    console.error("Gemini API error (all models failed):", err);
    if (err instanceof GeminiError) throw new Error(friendlyGeminiMessage(err));
    throw new Error("AI service error");
  }
 
  const data = await res.json();
  const candidate = data?.candidates?.[0];
  const parts: { text?: string; thought?: boolean }[] = candidate?.content?.parts ?? [];
  const text = parts
    .filter((p) => !p.thought)
    .map((p) => p.text ?? "")
    .join("");
  if (!text) throw new Error("No response from AI");
 
  if (candidate?.finishReason === "MAX_TOKENS") {
    console.error("Gemini response was cut off (MAX_TOKENS)");
    throw new Error("The AI answer was cut off. Try again with fewer questions.");
  }
 
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse Gemini JSON response:", text);
    throw new Error("AI returned an unexpected response format");
  }
}
 
/* ------------------------------------------------------------------ */
/* OpenAI-compatible providers: xAI (Grok), OpenRouter, Groq           */
/* ------------------------------------------------------------------ */
 
type CompatCfg = { name: string; url: string; key: string; model: string };
 
// Edit the env variable names below if yours are different in .env
function compatConfig(name: string): CompatCfg | null {
  const env = process.env;
  if (name === "xai" && env["XAI_API_KEY"])
    return {
      name,
      url: "https://api.x.ai/v1/chat/completions",
      key: env["XAI_API_KEY"],
      model: env["XAI_MODEL"] || "grok-4-fast",
    };
  if (name === "openrouter" && env["OPENROUTER_API_KEY"])
    return {
      name,
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: env["OPENROUTER_API_KEY"],
      model: env["OPENROUTER_MODEL"] || "google/gemini-2.5-flash",
    };
  if (name === "groq" && env["GROQ_API_KEY"])
    return {
      name,
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: env["GROQ_API_KEY"],
      model: env["GROQ_MODEL"] || "llama-3.3-70b-versatile",
    };
  return null;
}
 
async function callOpenAICompat(cfg: CompatCfg, body: ChatBody) {
  const res = await fetch(cfg.url, {
    method: "POST",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.key}` },
    body: JSON.stringify({ model: cfg.model, temperature: 0.6, max_tokens: 8192, ...body }),
  });
  if (!res.ok) throw new Error(`${cfg.name} ${res.status}: ${(await res.text()).slice(0, 300)}`);
 
  const data = await res.json();
  const choice = data?.choices?.[0];
  if (choice?.finish_reason === "length") {
    throw new Error(`${cfg.name}: response cut off (max tokens)`);
  }
  const msg = choice?.message;
  const raw: string | undefined = msg?.tool_calls?.[0]?.function?.arguments ?? msg?.content;
  if (!raw) throw new Error(`${cfg.name}: empty response`);
 
  // Some models wrap JSON in ```json fences; strip them before parsing.
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}
 
/* ------------------------------------------------------------------ */
/* Main entry: tries providers in order, skips ones with no key        */
/* ------------------------------------------------------------------ */
 
// Set AI_PROVIDER_ORDER in .env, e.g.  AI_PROVIDER_ORDER=xai,openrouter,gemini
// Valid names: xai, openrouter, groq, gemini
async function callAI(body: ChatBody) {
  const order = (process.env["AI_PROVIDER_ORDER"] || "xai,openrouter,gemini")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
 
  const errors: string[] = [];
 
  for (const name of order) {
    const t0 = Date.now();
    try {
      let result;
      if (name === "gemini") {
        if (!process.env["GEMINI_API_KEY"]) continue;
        result = await callGemini(body);
      } else {
        const cfg = compatConfig(name);
        if (!cfg) continue; // no key for this provider, skip it
        result = await callOpenAICompat(cfg, body);
      }
      console.log(`[AI] ${name} ok in ${Date.now() - t0}ms`);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${name}: ${msg}`);
      console.warn(`[AI] ${name} failed after ${Date.now() - t0}ms: ${msg}`);
    }
  }
 
  console.error("[AI] All providers failed:\n" + errors.join("\n"));
  throw new Error("All AI providers failed. Check the server terminal and your API keys.");
}
 
function tool(name: string, parameters: Record<string, unknown>) {
  return {
    tools: [{ type: "function", function: { name, description: `Return ${name}`, parameters } }],
    tool_choice: { type: "function", function: { name } },
  };
}

/* ---------------- Mock interview ---------------- */
// Replace the existing `generateInterviewQuestions` in src/lib/career.functions.ts
// with everything below (keep the InterviewQuestion type and the rest of the file).

export type InterviewQuestion = { question: string; focus: string; hint: string };

// Works whatever ids your page sends ("hr", "HR Screening", "system-design", etc.).
function roundRules(round: string, role: string): { label: string; rules: string } {
  const r = (round || "").toLowerCase();

  if (r.includes("hr")) {
    return {
      label: "HR Screening",
      rules:
        `This is an HR screening call, NOT a technical round. Ask ONLY about: why they want this kind of job, career goals, strengths and weaknesses, salary expectations, notice period, relocation or work-mode preferences, handling pressure, and culture fit. ` +
        `Do NOT ask any coding, tool, framework or technical-knowledge questions, even though the candidate is a ${role}. The role may appear only as light context (for example "why ${role} as a career?").`,
    };
  }
  if (r.includes("behav")) {
    return {
      label: "Behavioural",
      rules:
        `This is a behavioural round. Every question must ask for a real past situation in STAR format ("Tell me about a time when..."): teamwork, conflict, failure, deadlines, feedback, leadership, ownership. ` +
        `Situations can come from a ${role}'s work life, but do NOT ask technical or coding questions.`,
    };
  }
  if (r.includes("system")) {
    return {
      label: "System Design",
      rules:
        `This is a system design round. Every question must be an open-ended design problem ("Design a ..."): architecture, components, data flow, scaling, bottlenecks, trade-offs, reliability. ` +
        `Fit the problems to a ${role}'s scope. Do NOT ask trivia, definitions or small coding questions.`,
    };
  }
  if (r.includes("resume")) {
    return {
      label: "Resume Deep-Dive",
      rules:
        `This is a resume deep-dive. Ask probing questions about the candidate's projects and past work as a ${role}: what they built, their exact contribution, decisions and trade-offs, what went wrong, how they measured results, what they would do differently. ` +
        `Phrase them as "In the project you listed...", since the candidate's resume is not provided.`,
    };
  }
  return {
    label: "Technical",
    rules:
      `This is a technical round. Ask core-skill, fundamentals and practical problem-solving questions specific to a ${role}. No HR or behavioural questions.`,
  };
}

export const generateInterviewQuestions = createServerFn({ method: "POST" })
  .inputValidator((d: { role: string; round: string; difficulty: string; count: number; company?: string }) => d)
  .handler(async ({ data }): Promise<{ questions: InterviewQuestion[] }> => {
    const count = Math.min(Math.max(Number(data.count) || 5, 1), 10);
    const { label, rules } = roundRules(data.round, data.role);

    console.log(`[Interview] round="${data.round}" -> ${label}, role="${data.role}"`);

    return await callAI({
      messages: [
        {
          role: "system",
          content:
            "You are a senior interviewer at a top company. The ROUND TYPE decides what kind of questions you ask. The role is only context. You never repeat yourself and never mix round types.",
        },
        {
          role: "user",
          content:
            `Round type: ${label}\n` +
            `Rules: ${rules}\n\n` +
            `Create ${count} ${label} interview questions for a ${data.difficulty}-level ${data.role}${
              data.company ? ` applying to ${data.company}` : ""
            }. For each, give the skill focus and a one-line hint about what a strong answer covers.`,
        },
      ],
      ...tool("return_questions", {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: { question: { type: "string" }, focus: { type: "string" }, hint: { type: "string" } },
              required: ["question", "focus", "hint"],
              additionalProperties: false,
            },
          },
        },
        required: ["questions"],
        additionalProperties: false,
      }),
    });
  });

// Paste this into src/lib/career.functions.ts, right after generateInterviewQuestions
// and before the "Resume" section. It restores the export mock-interview.tsx imports.

export type InterviewFeedback = {
  overallScore: number;
  verdict: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  perQuestion: { question: string; score: number; feedback: string; modelAnswer: string }[];
};

// How to judge answers depends on the round type.
function scoringFocus(round: string): string {
  const r = (round || "").toLowerCase();
  if (r.includes("hr"))
    return "Judge clarity, honesty, motivation, professionalism and culture fit. Do not penalise a lack of technical detail.";
  if (r.includes("behav"))
    return "Judge using the STAR structure (Situation, Task, Action, Result), specific examples, ownership and measurable results.";
  if (r.includes("system"))
    return "Judge architecture choices, scalability, trade-offs, bottlenecks and clarity of the design.";
  if (r.includes("resume"))
    return "Judge depth of ownership, specific contributions, decisions, trade-offs and measurable results in the described project.";
  return "Judge technical correctness, depth and clarity of the answer.";
}

export const evaluateInterview = createServerFn({ method: "POST" })
  .inputValidator((d: { role: string; round: string; answers: { question: string; answer: string }[] }) => d)
  .handler(async ({ data }): Promise<InterviewFeedback> => {
    const transcript = data.answers
      .map((a, i) => `Q${i + 1}: ${a.question}\nAnswer: ${a.answer?.slice(0, 4000) || "(no answer given)"}`)
      .join("\n\n");
    const result = await callAI({
      messages: [
        {
          role: "system",
          content: `You are a strict but encouraging interview coach. Score each answer 0-10 honestly; unanswered questions get 0. overallScore is 0-100. ${scoringFocus(data.round)}`,
        },
        { role: "user", content: `Evaluate this ${data.round} interview for a ${data.role} role.\n\n${transcript}` },
      ],
      ...tool("return_feedback", {
        type: "object",
        properties: {
          overallScore: { type: "integer" },
          verdict: { type: "string" },
          summary: { type: "string" },
          strengths: { type: "array", items: { type: "string" } },
          improvements: { type: "array", items: { type: "string" } },
          perQuestion: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                score: { type: "integer" },
                feedback: { type: "string" },
                modelAnswer: { type: "string" },
              },
              required: ["question", "score", "feedback", "modelAnswer"],
              additionalProperties: false,
            },
          },
        },
        required: ["overallScore", "verdict", "summary", "strengths", "improvements", "perQuestion"],
        additionalProperties: false,
      }),
    });

    // Recompute overallScore deterministically from the actual per-question
    // scores so it always agrees with what's shown per question below it.
    const perQuestion = result.perQuestion as { score: number }[] | undefined;
    if (Array.isArray(perQuestion) && perQuestion.length > 0) {
      const totalPossible = perQuestion.length * 10;
      const totalScored = perQuestion.reduce((sum, q) => sum + (Number(q.score) || 0), 0);
      result.overallScore = Math.round((totalScored / totalPossible) * 100);
    }

    return result as InterviewFeedback;
  });

/* ---------------- Resume ---------------- */
 
export const writeResumeSummary = createServerFn({ method: "POST" })
  .inputValidator((d: { role: string; skills: string; experience: string; tone: string }) => d)
  .handler(async ({ data }): Promise<{ summaries: string[] }> => {
    return await callAI({
      messages: [
        { role: "system", content: "You write sharp, ATS-friendly resume summaries. No fluff, no clichés, no first person." },
        {
          role: "user",
          content: `Write 3 alternative ${data.tone} resume summaries (2-3 sentences each) for a ${data.role}.\nSkills: ${data.skills}\nExperience: ${data.experience}`,
        },
      ],
      ...tool("return_summaries", {
        type: "object",
        properties: { summaries: { type: "array", items: { type: "string" } } },
        required: ["summaries"],
        additionalProperties: false,
      }),
    });
  });
 
export const improveBullets = createServerFn({ method: "POST" })
  .inputValidator((d: { role: string; text: string }) => d)
  .handler(async ({ data }): Promise<{ bullets: string[] }> => {
    return await callAI({
      messages: [
        {
          role: "system",
          content:
            "You rewrite resume bullet points using strong action verbs and measurable impact. Keep each under 30 words. Invent no false facts; use [X] placeholders when a metric is unknown.",
        },
        { role: "user", content: `Role: ${data.role}\nRewrite these into 4-6 strong bullets:\n${data.text}` },
      ],
      ...tool("return_bullets", {
        type: "object",
        properties: { bullets: { type: "array", items: { type: "string" } } },
        required: ["bullets"],
        additionalProperties: false,
      }),
    });
  });
 
export const scoreResume = createServerFn({ method: "POST" })
  .inputValidator((d: { resume: string; jobDescription?: string }) => d)
  .handler(
    async ({
      data,
    }): Promise<{ score: number; verdict: string; missingKeywords: string[]; fixes: string[]; strengths: string[] }> => {
      return await callAI({
        messages: [
          { role: "system", content: "You are an ATS resume screener. Score 0-100 and be specific and actionable." },
          {
            role: "user",
            content: `Resume:\n${data.resume.slice(0, 8000)}\n\n${
              data.jobDescription ? `Target job description:\n${data.jobDescription.slice(0, 4000)}` : "No job description supplied — score generally."
            }`,
          },
        ],
        ...tool("return_score", {
          type: "object",
          properties: {
            score: { type: "integer" },
            verdict: { type: "string" },
            missingKeywords: { type: "array", items: { type: "string" } },
            fixes: { type: "array", items: { type: "string" } },
            strengths: { type: "array", items: { type: "string" } },
          },
          required: ["score", "verdict", "missingKeywords", "fixes", "strengths"],
          additionalProperties: false,
        }),
      });
    },
  );
 
/* ---------------- Jobs ---------------- */
 
export const writeCoverLetter = createServerFn({ method: "POST" })
  .inputValidator((d: { jobTitle: string; company: string; jobSummary: string; profile: string; tone: string }) => d)
  .handler(async ({ data }): Promise<{ letter: string }> => {
    return await callAI({
      messages: [
        { role: "system", content: "You write concise, specific cover letters. Max 200 words. No generic filler." },
        {
          role: "user",
          content: `Write a ${data.tone} cover letter for the ${data.jobTitle} role at ${data.company}.\nRole details: ${data.jobSummary}\nCandidate profile: ${data.profile}`,
        },
      ],
      ...tool("return_letter", {
        type: "object",
        properties: { letter: { type: "string" } },
        required: ["letter"],
        additionalProperties: false,
      }),
    });
  });