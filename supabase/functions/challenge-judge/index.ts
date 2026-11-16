import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYS = `You are a strict but fair code judge. Given a problem, test cases, and a user's solution:
1. Mentally execute the solution against EACH test case.
2. Decide pass/fail per test (be honest — do not give credit for buggy code).
3. Return verdict via the tool.
Be concise in feedback. If failing, explain what's wrong and give ONE actionable hint (no full solution).`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { problem, code, language } = await req.json();
    if (!problem || !code) return j({ error: "Missing problem or code" }, 400);
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userMsg = `Problem: ${problem.title}\n\n${problem.description}\n\nTest cases:\n${
      problem.test_cases.map((t: any, i: number) => `${i + 1}. input=${t.input} → expected=${t.expected}`).join("\n")
    }\n\nLanguage: ${language}\n\nUser's solution:\n\`\`\`\n${code}\n\`\`\``;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: SYS }, { role: "user", content: userMsg }],
        tools: [{
          type: "function",
          function: {
            name: "judge",
            description: "Return judgment",
            parameters: {
              type: "object",
              properties: {
                passed: { type: "boolean", description: "True only if ALL test cases pass" },
                results: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      input: { type: "string" },
                      expected: { type: "string" },
                      actual: { type: "string" },
                      pass: { type: "boolean" },
                    },
                    required: ["input", "expected", "actual", "pass"],
                  },
                },
                feedback: { type: "string", description: "1-3 sentence feedback in markdown" },
              },
              required: ["passed", "results", "feedback"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "judge" } },
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) return j({ error: "Rate limit reached." }, 429);
      if (resp.status === 402) return j({ error: "AI credits exhausted." }, 402);
      return j({ error: "AI gateway error" }, 500);
    }
    const data = await resp.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return j({ error: "No verdict" }, 500);
    return j(JSON.parse(args));
  } catch (e) {
    console.error(e);
    return j({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function j(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}