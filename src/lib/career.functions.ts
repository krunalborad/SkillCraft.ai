import { createServerFn } from "@tanstack/react-start";

type ChatBody = Record<string, unknown>;

type OpenAIMessage = { role: string; content: string };
type ToolFunction = {
  type: "function";
  function: { name: string; description: string; parameters: Record<string, unknown> };
};

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

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

async function callAI(body: ChatBody) {
  const key = process.env["GEMINI_API_KEY"];
  if (!key) throw new Error("AI is not configured");

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
    maxOutputTokens: 2048,
  };
  if (schema) {
    generationConfig.responseMimeType = "application/json";
    generationConfig.responseSchema = sanitizeSchemaForGemini(schema);
  }

  const res = await fetch(`${GEMINI_URL}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: systemMessage ? { parts: [{ text: systemMessage }] } : undefined,
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      generationConfig,
    }),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("Rate limit reached. Try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted.");
    const t = await res.text();
    console.error("Gemini API error", res.status, t);
    throw new Error("AI service error");
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No response from AI");

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse Gemini JSON response:", text);
    throw new Error("AI returned an unexpected response format");
  }
}

function tool(name: string, parameters: Record<string, unknown>) {
  return {
    tools: [{ type: "function", function: { name, description: `Return ${name}`, parameters } }],
    tool_choice: { type: "function", function: { name } },
  };
}

/* ---------------- Mock interview ---------------- */

export type InterviewQuestion = { question: string; focus: string; hint: string };

export const generateInterviewQuestions = createServerFn({ method: "POST" })
  .inputValidator((d: { role: string; round: string; difficulty: string; count: number; company?: string }) => d)
  .handler(async ({ data }): Promise<{ questions: InterviewQuestion[] }> => {
    const count = Math.min(Math.max(Number(data.count) || 5, 1), 10);
    return await callAI({
      messages: [
        {
          role: "system",
          content:
            "You are a senior interviewer at a top technology company. You write realistic, role-specific interview questions and never repeat yourself.",
        },
        {
          role: "user",
          content: `Create ${count} ${data.round} interview questions for a ${data.difficulty}-level ${data.role}${
            data.company ? ` at ${data.company}` : ""
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

export type InterviewFeedback = {
  overallScore: number;
  verdict: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  perQuestion: { question: string; score: number; feedback: string; modelAnswer: string }[];
};

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
          content:
            "You are a strict but encouraging interview coach. Score each answer 0-10 honestly; unanswered questions get 0. overallScore is 0-100.",
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
