import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COURSE_CATALOG = `Available Lume.ai courses (use exact slugs):
- mastering-data-structures (Computer Science, Intermediate, 12h) — DSA, interview prep
- fullstack-react-node (Web Development, Intermediate, 14h) — React, Node, TypeScript, SaaS
- applied-machine-learning (AI/ML, Advanced, 16h) — Python, PyTorch, deep learning
- system-design-interview (Engineering, Advanced, 8h) — scalability, FAANG interviews
- product-design-foundations (Design, Beginner, 9h) — UI/UX, Figma, portfolio
- prompt-engineering-pros (AI/ML, Intermediate, 6h) — LLMs, RAG, agents`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { goal, hoursPerWeek, currentLevel } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userPrompt = `Build a personalized learning path for this student.

Goal: ${goal}
Available time: ${hoursPerWeek} hours/week
Current level: ${currentLevel}

${COURSE_CATALOG}

Return ONLY valid JSON in this exact shape:
{
  "title": "short catchy plan title (max 8 words)",
  "summary": "1-2 sentence motivational summary of the path",
  "weeks": 6-16,
  "milestones": [
    { "week": 1, "title": "...", "courseSlug": "exact-slug-from-list", "focus": "what to focus on", "project": "small project to build" }
  ],
  "tips": ["3-5 short, specific tips for this learner"]
}

Pick 3-6 courses ordered logically. Each milestone must reference one of the exact slugs above.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert learning coach. Always respond with valid JSON only — no prose, no markdown fences." },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return json({ error: "Rate limit reached. Try again shortly." }, 429);
      if (response.status === 402) return json({ error: "AI credits exhausted." }, 402);
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return json({ error: "AI gateway error" }, 500);
    }

    const data = await response.json();
    let content: string = data.choices?.[0]?.message?.content ?? "";
    content = content.trim().replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "");

    let plan;
    try {
      plan = JSON.parse(content);
    } catch {
      const m = content.match(/\{[\s\S]*\}/);
      if (!m) return json({ error: "Could not parse AI response" }, 500);
      plan = JSON.parse(m[0]);
    }
    return json({ plan });
  } catch (e) {
    console.error("learning-path error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}