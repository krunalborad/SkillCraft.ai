import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { topic, difficulty = "intermediate", count = 5 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!topic) return j({ error: "topic is required" }, 400);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert quiz designer. Create high-quality multiple-choice questions that genuinely test understanding, not memorization." },
          { role: "user", content: `Generate ${count} multiple choice questions about "${topic}" at ${difficulty} level. Each must have exactly 4 options. Provide a clear 1-2 sentence explanation for the correct answer.` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_quiz",
            description: "Return the generated quiz",
            parameters: {
              type: "object",
              properties: {
                questions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
                      correctIndex: { type: "integer", minimum: 0, maximum: 3 },
                      explanation: { type: "string" },
                    },
                    required: ["question", "options", "correctIndex", "explanation"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["questions"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_quiz" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return j({ error: "Rate limit reached. Try again shortly." }, 429);
      if (response.status === 402) return j({ error: "AI credits exhausted." }, 402);
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return j({ error: "AI gateway error" }, 500);
    }

    const data = await response.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return j({ error: "No quiz returned" }, 500);
    const parsed = typeof args === "string" ? JSON.parse(args) : args;
    return j(parsed);
  } catch (e) {
    console.error("quiz-generator error:", e);
    return j({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function j(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}