import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, XCircle, RefreshCw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "AI Quiz Generator — SkillCraft" },
      { name: "description", content: "Generate adaptive multiple-choice quizzes on any topic, instantly. Powered by SkillCraft's AI tutor." },
    ],
  }),
  component: QuizPage,
});

type Question = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

function QuizPage() {
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return toast.error("Enter a topic first");
    setLoading(true);
    setSubmitted(false);
    setAnswers({});
    setQuestions([]);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quiz-generator`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ topic, difficulty, count }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) toast.error("Slow down — rate limit reached.");
        else if (res.status === 402) toast.error("AI credits exhausted.");
        else toast.error(data.error || "Failed to generate quiz");
        return;
      }
      setQuestions(data.questions || []);
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
  const allAnswered = questions.length > 0 && questions.every((_, i) => answers[i] !== undefined);

  const submit = async () => {
    setSubmitted(true);
    if (!user) return;
    const xpEarned = score * 5;
    setSaving(true);
    try {
      const { error } = await supabase.from("quiz_attempts").insert({
        user_id: user.id,
        topic: topic.trim() || "General",
        difficulty,
        total: questions.length,
        correct: score,
        xp_earned: xpEarned,
      });
      if (error) throw error;
      if (xpEarned > 0) {
        const { data: prof } = await supabase.from("profiles").select("xp").eq("user_id", user.id).maybeSingle();
        if (prof) await supabase.from("profiles").update({ xp: (prof.xp ?? 0) + xpEarned }).eq("user_id", user.id);
        toast.success(`Quiz saved · +${xpEarned} XP`);
      } else {
        toast.success("Quiz saved to your dashboard");
      }
    } catch {
      toast.error("Couldn't save this quiz result");
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="relative">
      <div className="absolute -top-40 right-0 h-[40rem] w-[40rem] rounded-full bg-gradient-to-br from-primary/40 to-accent/40 blur-[120px] opacity-30 pointer-events-none" />
      <section className="relative mx-auto max-w-4xl px-6 py-16">
        <span className="text-xs font-mono uppercase tracking-widest text-primary">— AI Quiz Lab —</span>
        <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold tracking-tighter">
          Test yourself on <span className="text-gradient">anything</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Type a topic. SkillCraft builds a fresh multiple-choice quiz with explanations — perfect for active recall before an exam or interview.
        </p>

        <div className="mt-10 rounded-2xl bg-gradient-card border border-border/60 p-6 shadow-elegant">
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Topic</label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. React hooks, Big-O notation, TCP vs UDP, prompt engineering..."
            className="mt-2 bg-background/50"
            onKeyDown={(e) => e.key === "Enter" && generate()}
          />

          <div className="mt-5 grid sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Difficulty</label>
              <div className="mt-2 flex gap-2">
                {(["beginner", "intermediate", "advanced"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                      difficulty === d
                        ? "bg-primary/15 border-primary/50 text-foreground"
                        : "border-border/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Questions</label>
              <div className="mt-2 flex gap-2">
                {[3, 5, 8, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                      count === n
                        ? "bg-primary/15 border-primary/50 text-foreground"
                        : "border-border/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button variant="hero" size="lg" className="w-full mt-6" onClick={generate} disabled={loading}>
            {loading ? <><Loader2 className="animate-spin mr-1.5" /> Generating…</> : <><Sparkles className="mr-1.5" /> Generate quiz</>}
          </Button>
        </div>

        {questions.length > 0 && (
          <div className="mt-10 space-y-5">
            {questions.map((q, qi) => (
              <div key={qi} className="rounded-2xl bg-gradient-card border border-border/60 p-6">
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs text-primary mt-1">Q{qi + 1}</span>
                  <h3 className="font-display font-semibold flex-1">{q.question}</h3>
                </div>
                <div className="mt-4 space-y-2">
                  {q.options.map((opt, oi) => {
                    const picked = answers[qi] === oi;
                    const isCorrect = oi === q.correctIndex;
                    let cls = "border-border/60 hover:border-primary/40";
                    if (submitted) {
                      if (isCorrect) cls = "border-success/60 bg-success/10";
                      else if (picked) cls = "border-destructive/60 bg-destructive/10";
                      else cls = "border-border/30 opacity-60";
                    } else if (picked) cls = "border-primary/60 bg-primary/10";
                    return (
                      <button
                        key={oi}
                        disabled={submitted}
                        onClick={() => setAnswers({ ...answers, [qi]: oi })}
                        className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border text-sm transition-all ${cls}`}
                      >
                        <span className="font-mono text-xs text-muted-foreground">{String.fromCharCode(65 + oi)}</span>
                        <span className="flex-1">{opt}</span>
                        {submitted && isCorrect && <CheckCircle2 className="h-4 w-4 text-success" />}
                        {submitted && picked && !isCorrect && <XCircle className="h-4 w-4 text-destructive" />}
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <div className="mt-4 p-3 rounded-lg glass border-border/60 text-sm text-muted-foreground">
                    <span className="text-primary font-medium">Why: </span>{q.explanation}
                  </div>
                )}
              </div>
            ))}

            {!submitted ? (
              <Button variant="hero" size="lg" className="w-full" disabled={!allAnswered || saving} onClick={submit}>
                {allAnswered ? (saving ? "Saving…" : "Submit answers") : `Answer all ${questions.length} questions to submit`}
              </Button>
            ) : (
              <div className="rounded-2xl bg-gradient-card border border-primary/40 p-6 text-center shadow-glow">
                <Trophy className="h-10 w-10 text-warning mx-auto" />
                <div className="mt-3 font-display text-3xl font-bold">
                  {score} / {questions.length}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {score === questions.length ? "Flawless. You're ready." : score >= questions.length * 0.7 ? "Solid run — review the misses." : "Worth another loop. Practice makes it stick."}
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  {user ? "Saved to your dashboard." : "Sign in to save this score and earn XP on your dashboard."}
                </p>
                <Button variant="glow" className="mt-5" onClick={generate}>
                  <RefreshCw className="mr-1.5 h-4 w-4" /> New quiz
                </Button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
