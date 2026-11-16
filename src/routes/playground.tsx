import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, Loader2, Code2, Trophy, Lightbulb, Play, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/playground")({
  head: () => ({
    meta: [
      { title: "Code Lab — AI Code Reviewer | SkillCraft" },
      { name: "description", content: "Paste your code and get instant AI review: bugs, improvements, and a refactored version." },
    ],
  }),
  component: Playground,
});

function Playground() {
  const [tab, setTab] = useState<"review" | "challenge">("review");
  return (
    <div className="relative">
      <div className="absolute -top-40 left-0 h-[40rem] w-[40rem] rounded-full bg-gradient-to-br from-accent/40 to-primary/40 blur-[120px] opacity-30 pointer-events-none" />
      <section className="relative mx-auto max-w-7xl px-6 py-16">
        <span className="text-xs font-mono uppercase tracking-widest text-primary">— Code Lab —</span>
        <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold tracking-tighter">
          Sharpen your <span className="text-gradient">coding edge</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Get senior-level AI code reviews, or take on fresh LeetCode-style challenges generated on demand.
        </p>

        <div className="mt-8 inline-flex rounded-xl bg-background/60 border border-border/60 p-1">
          <button
            onClick={() => setTab("review")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === "review" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Sparkles className="inline h-4 w-4 mr-1.5" /> Code Review
          </button>
          <button
            onClick={() => setTab("challenge")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === "challenge" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Trophy className="inline h-4 w-4 mr-1.5" /> Challenges
          </button>
        </div>

        <div className="mt-8">
          {tab === "review" ? <ReviewTab /> : <ChallengeTab />}
        </div>
      </section>
    </div>
  );
}

const SAMPLE = `function fib(n) {
  if (n < 2) return n;
  return fib(n-1) + fib(n-2);
}`;

function ReviewTab() {
  const [code, setCode] = useState(SAMPLE);
  const [language, setLanguage] = useState("javascript");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!code.trim()) return toast.error("Paste some code first");
    setLoading(true);
    setReview("");
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/code-review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ code, language }),
      });
      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("Rate limit reached.");
        else if (resp.status === 402) toast.error("AI credits exhausted.");
        else toast.error("Failed to start review");
        setLoading(false);
        return;
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || !line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) setReview((r) => r + c);
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-gradient-card border border-border/60 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-primary" />
                <span className="font-display font-semibold text-sm">Your code</span>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-background/60 border border-border/60 text-xs rounded-md px-2 py-1"
              >
                {["javascript", "typescript", "python", "java", "c++", "go", "rust", "sql"].map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="flex-1 min-h-[400px] bg-background/60 border border-border/60 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:border-primary/50"
            />
            <Button variant="hero" className="mt-4" onClick={run} disabled={loading}>
              {loading ? <><Loader2 className="animate-spin mr-1.5" /> Reviewing…</> : <><Sparkles className="mr-1.5" /> Review my code</>}
            </Button>
          </div>

          <div className="rounded-2xl bg-gradient-card border border-border/60 p-5 min-h-[400px]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-display font-semibold text-sm">AI review</span>
            </div>
            {review ? (
              <div className="prose prose-sm prose-invert max-w-none">
                <ReactMarkdown>{review}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Your review will stream in here…</p>
            )}
          </div>
        </div>
  );
}

type Problem = {
  title: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  starter_code: string;
  hints: string[];
  test_cases: { input: string; expected: string }[];
};

type Verdict = {
  passed: boolean;
  results: { input: string; expected: string; actual: string; pass: boolean }[];
  feedback: string;
};

const XP_BY_DIFFICULTY = { easy: 20, medium: 50, hard: 100 } as const;
const TOPICS = ["arrays", "strings", "hash maps", "two pointers", "recursion", "dynamic programming", "graphs", "trees", "math", "sorting"];

function ChallengeTab() {
  const { user } = useAuth();
  const [topic, setTopic] = useState("arrays");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [language, setLanguage] = useState("javascript");
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [loadingProblem, setLoadingProblem] = useState(false);
  const [judging, setJudging] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase.from("solved_challenges").select("id", { count: "exact", head: true })
      .eq("user_id", user.id).then(({ count }) => setSolvedCount(count ?? 0));
  }, [user]);

  const generate = async () => {
    setLoadingProblem(true);
    setProblem(null);
    setVerdict(null);
    setHintsShown(0);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/challenge-generator`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ topic, difficulty, language }),
      });
      if (!resp.ok) {
        if (resp.status === 429) toast.error("Rate limit reached.");
        else if (resp.status === 402) toast.error("AI credits exhausted.");
        else toast.error("Couldn't generate a problem");
        return;
      }
      const p: Problem = await resp.json();
      setProblem(p);
      setCode(p.starter_code);
    } catch {
      toast.error("Network error");
    } finally {
      setLoadingProblem(false);
    }
  };

  const submit = async () => {
    if (!problem) return;
    setJudging(true);
    setVerdict(null);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/challenge-judge`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ problem, code, language }),
      });
      if (!resp.ok) {
        if (resp.status === 429) toast.error("Rate limit reached.");
        else if (resp.status === 402) toast.error("AI credits exhausted.");
        else toast.error("Judging failed");
        return;
      }
      const v: Verdict = await resp.json();
      setVerdict(v);
      if (v.passed && user) {
        const xp = XP_BY_DIFFICULTY[problem.difficulty] ?? 20;
        const { error } = await supabase.from("solved_challenges").insert({
          user_id: user.id,
          challenge_title: problem.title,
          difficulty: problem.difficulty,
          language,
          xp_earned: xp,
        });
        if (!error) {
          // award XP on profile
          const { data: prof } = await supabase.from("profiles").select("xp").eq("user_id", user.id).maybeSingle();
          if (prof) {
            await supabase.from("profiles").update({ xp: (prof.xp ?? 0) + xp }).eq("user_id", user.id);
          }
          setSolvedCount((c) => c + 1);
          toast.success(`🎉 Accepted! +${xp} XP`);
        } else if (error.code === "23505") {
          toast.success("Accepted! (already solved before — no extra XP)");
        }
      } else if (v.passed && !user) {
        toast.success("Accepted! Sign in to save XP.");
      } else {
        toast.error("Some tests failed — check feedback.");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setJudging(false);
    }
  };

  if (!problem) {
    return (
      <div className="rounded-2xl bg-gradient-card border border-border/60 p-8 max-w-2xl">
        <div className="flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-widest text-primary">
          <Trophy className="h-3.5 w-3.5" /> Solved: {solvedCount}
        </div>
        <h2 className="font-display text-2xl font-bold mb-1">Generate a challenge</h2>
        <p className="text-sm text-muted-foreground mb-6">Pick a topic & difficulty. SkillCraft crafts a fresh problem with hidden test cases.</p>

        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="text-muted-foreground">Topic</span>
            <select value={topic} onChange={(e) => setTopic(e.target.value)} className="bg-background/60 border border-border/60 rounded-md px-3 py-2 text-sm">
              {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="text-muted-foreground">Difficulty</span>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} className="bg-background/60 border border-border/60 rounded-md px-3 py-2 text-sm">
              <option value="easy">Easy (+20 XP)</option>
              <option value="medium">Medium (+50 XP)</option>
              <option value="hard">Hard (+100 XP)</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="text-muted-foreground">Language</span>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-background/60 border border-border/60 rounded-md px-3 py-2 text-sm">
              {["javascript", "typescript", "python", "java", "c++", "go"].map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
        </div>

        <Button variant="hero" onClick={generate} disabled={loadingProblem}>
          {loadingProblem ? <><Loader2 className="animate-spin mr-1.5" /> Generating…</> : <><Sparkles className="mr-1.5" /> Generate problem</>}
        </Button>
      </div>
    );
  }

  const difficultyColor =
    problem.difficulty === "easy" ? "text-green-400" :
    problem.difficulty === "medium" ? "text-yellow-400" : "text-red-400";

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="rounded-2xl bg-gradient-card border border-border/60 p-6 max-h-[700px] overflow-y-auto">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className={`text-xs font-mono uppercase tracking-widest ${difficultyColor}`}>{problem.difficulty}</span>
            <h2 className="font-display text-2xl font-bold mt-1">{problem.title}</h2>
          </div>
          <Button size="sm" variant="ghost" onClick={() => { setProblem(null); setVerdict(null); }}>
            <RefreshCw className="h-4 w-4 mr-1" /> New
          </Button>
        </div>

        <div className="prose prose-sm prose-invert max-w-none">
          <ReactMarkdown>{problem.description}</ReactMarkdown>
        </div>

        <div className="mt-5 space-y-3">
          {problem.examples.map((ex, i) => (
            <div key={i} className="rounded-lg bg-background/60 border border-border/40 p-3 font-mono text-xs">
              <div><span className="text-muted-foreground">Input:</span> {ex.input}</div>
              <div><span className="text-muted-foreground">Output:</span> {ex.output}</div>
              {ex.explanation && <div className="mt-1 text-muted-foreground not-italic">// {ex.explanation}</div>}
            </div>
          ))}
        </div>

        <div className="mt-5">
          <Button size="sm" variant="outline" onClick={() => setHintsShown((n) => Math.min(n + 1, problem.hints.length))} disabled={hintsShown >= problem.hints.length}>
            <Lightbulb className="h-4 w-4 mr-1" />
            {hintsShown === 0 ? "Show hint" : hintsShown >= problem.hints.length ? "No more hints" : "Next hint"}
          </Button>
          {problem.hints.slice(0, hintsShown).map((h, i) => (
            <div key={i} className="mt-2 text-sm text-muted-foreground italic border-l-2 border-primary/40 pl-3">
              💡 {h}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-card border border-border/60 p-5 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <Code2 className="h-4 w-4 text-primary" />
          <span className="font-display font-semibold text-sm">Your solution ({language})</span>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="flex-1 min-h-[300px] bg-background/60 border border-border/60 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:border-primary/50"
        />
        <Button variant="hero" className="mt-4" onClick={submit} disabled={judging}>
          {judging ? <><Loader2 className="animate-spin mr-1.5" /> Judging…</> : <><Play className="mr-1.5" /> Run & Submit</>}
        </Button>

        {verdict && (
          <div className={`mt-4 rounded-lg border p-4 ${verdict.passed ? "border-green-500/40 bg-green-500/5" : "border-red-500/40 bg-red-500/5"}`}>
            <div className="flex items-center gap-2 font-display font-bold mb-2">
              {verdict.passed ? <><CheckCircle2 className="h-5 w-5 text-green-400" /> Accepted</> : <><XCircle className="h-5 w-5 text-red-400" /> Wrong Answer</>}
            </div>
            <div className="prose prose-sm prose-invert max-w-none mb-3">
              <ReactMarkdown>{verdict.feedback}</ReactMarkdown>
            </div>
            <div className="space-y-1.5">
              {verdict.results.map((r, i) => (
                <div key={i} className="font-mono text-xs flex items-start gap-2">
                  {r.pass ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />}
                  <span className="text-muted-foreground truncate">
                    {r.input} → expected <span className="text-foreground">{r.expected}</span>
                    {!r.pass && <>, got <span className="text-red-400">{r.actual}</span></>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}