import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Loader2, Target, BookOpen, Lightbulb, ArrowRight, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { courses } from "@/lib/courses";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/learning-path")({
  head: () => ({
    meta: [
      { title: "AI Learning Path Generator — SkillCraft" },
      { name: "description", content: "Tell SkillCraft your goal and we'll generate a personalized, week-by-week course roadmap built around your time and skill level." },
      { property: "og:title", content: "AI Learning Path Generator — SkillCraft" },
    ],
  }),
  component: LearningPathPage,
});

type Milestone = { week: number; title: string; courseSlug: string; focus: string; project: string };
type Plan = { title: string; summary: string; weeks: number; milestones: Milestone[]; tips: string[] };

function LearningPathPage() {
  const [goal, setGoal] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("8");
  const [currentLevel, setCurrentLevel] = useState("Beginner");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);

  const onGenerate = async () => {
    if (!goal.trim()) {
      toast.error("Tell us what you want to learn or build");
      return;
    }
    setLoading(true);
    setPlan(null);
    try {
      const { data, error } = await supabase.functions.invoke("learning-path", {
        body: { goal, hoursPerWeek, currentLevel },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setPlan(data.plan);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    "Land a frontend engineer job in 3 months",
    "Become an ML engineer from scratch",
    "Pass FAANG system design interviews",
    "Ship my first AI product",
  ];

  return (
    <div className="relative">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[40rem] w-[60rem] rounded-full bg-gradient-primary blur-[140px] opacity-20 pointer-events-none" />
      <section className="relative pt-16 pb-10">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary mb-4">
            <Wand2 className="h-3.5 w-3.5" /> AI feature
          </span>
          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tighter">
            Your <span className="text-gradient">personal roadmap</span>, generated.
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-muted-foreground">
            Tell SkillCraft what you want to achieve. We'll build a week-by-week plan from real courses — tailored to your time and skill.
          </p>
        </div>
      </section>

      <section className="pb-12">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-3xl bg-gradient-card border border-border/60 p-6 md:p-8 shadow-elegant">
            <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
              What do you want to achieve?
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Land a junior full-stack role in 4 months. I know HTML/CSS basics."
              rows={3}
              className="w-full bg-input border border-border/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60 resize-none"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setGoal(ex)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>

            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                  Hours per week
                </label>
                <select
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(e.target.value)}
                  className="w-full bg-input border border-border/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60"
                >
                  {["3", "5", "8", "12", "20"].map((h) => (
                    <option key={h} value={h}>{h} hours</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                  Current level
                </label>
                <select
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(e.target.value)}
                  className="w-full bg-input border border-border/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60"
                >
                  {["Complete beginner", "Beginner", "Intermediate", "Advanced"].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button variant="hero" size="lg" className="w-full mt-6" onClick={onGenerate} disabled={loading}>
              {loading ? (
                <><Loader2 className="mr-2 animate-spin" />Crafting your plan…</>
              ) : (
                <><Sparkles className="mr-2" />Generate my path</>
              )}
            </Button>
          </div>
        </div>
      </section>

      {plan && (
        <section className="pb-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="rounded-3xl bg-gradient-card border border-primary/30 p-6 md:p-8 shadow-glow mb-8">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary mb-3">
                <Target className="h-3.5 w-3.5" /> Your {plan.weeks}-week plan
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">{plan.title}</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">{plan.summary}</p>
            </div>

            <div className="space-y-4">
              {plan.milestones.map((m, i) => {
                const course = courses.find((c) => c.slug === m.courseSlug);
                return (
                  <div key={i} className="rounded-2xl bg-gradient-card border border-border/60 p-6 hover:border-primary/40 transition-colors">
                    <div className="flex flex-wrap items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground font-display font-bold flex-shrink-0">
                        W{m.week}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-xl font-bold">{m.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{m.focus}</p>

                        {course && (
                          <Link
                            to="/courses/$slug/watch"
                            params={{ slug: course.slug }}
                            className="mt-4 inline-flex items-center gap-2 text-sm rounded-lg glass border-border/60 px-3 py-2 hover:border-primary/50 transition-colors"
                          >
                            <BookOpen className="h-4 w-4 text-primary" />
                            <span className="font-medium">{course.title}</span>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                          </Link>
                        )}

                        <div className="mt-4 flex items-start gap-2 text-sm">
                          <Lightbulb className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground"><span className="text-foreground font-medium">Build this:</span> {m.project}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {plan.tips?.length > 0 && (
              <div className="mt-10 rounded-2xl glass border-border/60 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-display font-bold">SkillCraft's tips for you</span>
                </div>
                <ul className="space-y-2">
                  {plan.tips.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-1">→</span><span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}