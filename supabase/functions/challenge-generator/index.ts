import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYS = `You are a coding-interview problem setter. Generate ONE original LeetCode-style problem.
Return ONLY valid JSON via the tool. Keep titles short and unique-sounding.
Tests must be deterministic and cover edge cases. Provide starter code as a function stub in the requested language.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { topic = "arrays", difficulty = "easy", language = "javascript" } = await req.json();
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY not configured");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYS },
          { role: "user", content: `Topic: ${topic}\nDifficulty: ${difficulty}\nLanguage: ${language}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "make_problem",
            description: "Return a coding challenge",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                description: { type: "string", description: "Markdown problem statement with constraints" },
                examples: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      input: { type: "string" },
                      output: { type: "string" },
                      explanation: { type: "string" },
                    },
                    required: ["input", "output"],
                  },
                },
                starter_code: { type: "string" },
                hints: { type: "array", items: { type: "string" } },
                test_cases: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: { input: { type: "string" }, expected: { type: "string" } },
                    required: ["input", "expected"],
                  },
                },
              },
              required: ["title", "difficulty", "description", "examples", "starter_code", "hints", "test_cases"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "make_problem" } },
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) return j({ error: "Rate limit reached." }, 429);
      if (resp.status === 402) return j({ error: "AI credits exhausted." }, 402);
      return j({ error: "AI gateway error" }, 500);
    }
    const data = await resp.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return j({ error: "No problem generated" }, 500);
    return j(JSON.parse(args));
  } catch (e) {
    console.error(e);
    return j({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function j(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}