import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYS = `You are Lume Code Reviewer — a sharp senior engineer.
Given a snippet, return:
1. A 1-sentence verdict.
2. Bugs / correctness issues (bullet list, empty if none).
3. Improvements (bullets: readability, performance, idiomatic style).
4. A refactored version in a single fenced code block.
Be concise. Use markdown.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { code, language = "auto-detect" } = await req.json();
    if (!code || code.length > 8000) return j({ error: "Provide code under 8000 chars" }, 400);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYS },
          { role: "user", content: `Language: ${language}\n\n\`\`\`\n${code}\n\`\`\`` },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return j({ error: "Rate limit reached." }, 429);
      if (response.status === 402) return j({ error: "AI credits exhausted." }, 402);
      return j({ error: "AI gateway error" }, 500);
    }
    return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("code-review error:", e);
    return j({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function j(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}