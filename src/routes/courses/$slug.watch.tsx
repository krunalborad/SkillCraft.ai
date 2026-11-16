import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, CheckCircle2, PlayCircle, Lock, Sparkles, Timer, Play, Pause, RotateCcw, NotebookPen, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCourse, type Course, type Lesson } from "@/lib/courses";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/courses/$slug/watch")({
  loader: ({ params }) => {
    const course = getCourse(params.slug);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => {
    const c = loaderData?.course;
    return {
      meta: [
        { title: c ? `Watch: ${c.title} — SkillCraft` : "Watch — SkillCraft" },
        { name: "description", content: c?.description ?? "" },
      ],
    };
  },
  component: WatchPage,
});

type Flat = { lesson: Lesson; modIdx: number; lesIdx: number; modTitle: string; globalIdx: number };

function WatchPage() {
  const { course: c } = Route.useLoaderData() as { course: Course };
  const { user } = useAuth();
  const flat: Flat[] = [];
  c.curriculum.forEach((m, mi) =>
    m.lessons.forEach((l, li) =>
      flat.push({ lesson: l, modIdx: mi, lesIdx: li, modTitle: m.title, globalIdx: flat.length }),
    ),
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const active = flat[activeIdx];

  // Load progress from backend (signed-in) or localStorage (guest)
  useEffect(() => {
    if (user) {
      supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("course_slug", c.slug)
        .then(({ data }) => {
          if (!data) return;
          const ids = new Set(data.map((d) => d.lesson_id));
          const next = new Set<number>();
          flat.forEach((f) => { if (ids.has(f.lesson.videoId)) next.add(f.globalIdx); });
          setCompleted(next);
        });
    } else if (typeof window !== "undefined") {
      const raw = localStorage.getItem(`lume:progress:${c.slug}`);
      if (raw) try { setCompleted(new Set(JSON.parse(raw))); } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, c.slug]);

  const toggleComplete = async (i: number) => {
    const s = new Set(completed);
    const wasDone = s.has(i);
    wasDone ? s.delete(i) : s.add(i);
    setCompleted(s);
    const lessonId = flat[i].lesson.videoId;

    if (user) {
      if (wasDone) {
        await supabase.from("lesson_progress").delete().match({ user_id: user.id, course_slug: c.slug, lesson_id: lessonId });
      } else {
        await supabase.from("lesson_progress").insert({ user_id: user.id, course_slug: c.slug, lesson_id: lessonId });
        // award XP
        const { data: prof } = await supabase.from("profiles").select("xp, current_streak, longest_streak, last_active_date").eq("user_id", user.id).maybeSingle();
        if (prof) {
          const today = new Date().toISOString().slice(0, 10);
          const last = prof.last_active_date as string | null;
          let streak = prof.current_streak ?? 0;
          if (last !== today) {
            const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
            streak = last === y ? streak + 1 : 1;
          }
          await supabase.from("profiles").update({
            xp: (prof.xp ?? 0) + 10,
            current_streak: streak,
            longest_streak: Math.max(prof.longest_streak ?? 0, streak),
            last_active_date: today,
          }).eq("user_id", user.id);
        }
        // course completion -> certificate
        if (s.size === flat.length) {
          await supabase.from("certificates").upsert({ user_id: user.id, course_slug: c.slug, course_title: c.title }, { onConflict: "user_id,course_slug" });
          toast.success("🎉 Course complete! Certificate unlocked.");
        } else {
          toast.success("+10 XP");
        }
      }
    } else if (typeof window !== "undefined") {
      localStorage.setItem(`lume:progress:${c.slug}`, JSON.stringify([...s]));
    }
  };

  const progress = Math.round((completed.size / flat.length) * 100);

  // Per-lesson notes — backend when signed in, localStorage as fallback
  const noteKey = `lume:notes:${c.slug}:${active.lesson.videoId}`;
  const [note, setNote] = useState("");
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (user) {
        const { data } = await supabase.from("lesson_notes").select("content").eq("user_id", user.id).eq("course_slug", c.slug).eq("lesson_id", active.lesson.videoId).maybeSingle();
        if (!cancelled) setNote(data?.content ?? "");
      } else if (typeof window !== "undefined") {
        setNote(localStorage.getItem(noteKey) ?? "");
      }
    })();
    return () => { cancelled = true; };
  }, [user, noteKey, c.slug, active.lesson.videoId]);

  useEffect(() => {
    if (!user) {
      if (typeof window !== "undefined") localStorage.setItem(noteKey, note);
      return;
    }
    const t = setTimeout(() => {
      supabase.from("lesson_notes").upsert(
        { user_id: user.id, course_slug: c.slug, lesson_id: active.lesson.videoId, content: note },
        { onConflict: "user_id,course_slug,lesson_id" },
      );
    }, 600);
    return () => clearTimeout(t);
  }, [note, noteKey, user, c.slug, active.lesson.videoId]);

  // Pomodoro focus timer (25 min)
  const [secs, setSecs] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const intRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (running) {
      intRef.current = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    }
    return () => {
      if (intRef.current) clearInterval(intRef.current);
    };
  }, [running]);
  useEffect(() => {
    if (secs === 0) setRunning(false);
  }, [secs]);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <div>
      <div className={`absolute -top-40 right-0 h-[40rem] w-[40rem] rounded-full bg-gradient-to-br ${c.gradient} blur-[120px] opacity-30 pointer-events-none`} />
      <div className="relative mx-auto max-w-7xl px-6 py-10">
        <Link
          to="/courses/$slug"
          params={{ slug: c.slug }}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Course overview
        </Link>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <div>
            <div className="aspect-video rounded-2xl overflow-hidden border border-border/60 bg-black shadow-elegant">
              <iframe
                key={active.lesson.videoId}
                src={`https://www.youtube.com/embed/${active.lesson.videoId}?rel=0&modestbranding=1`}
                title={active.lesson.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary mb-2">
                <span>Module {active.modIdx + 1}</span><span>·</span><span>{active.modTitle}</span>
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight">{active.lesson.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Lesson {active.globalIdx + 1} of {flat.length} · {active.lesson.duration}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button
                  variant={completed.has(active.globalIdx) ? "glow" : "hero"}
                  onClick={() => toggleComplete(active.globalIdx)}
                >
                  <CheckCircle2 className="mr-1.5" />
                  {completed.has(active.globalIdx) ? "Completed" : "Mark complete"}
                </Button>
                <Button
                  variant="glow"
                  onClick={() => setActiveIdx(Math.min(flat.length - 1, activeIdx + 1))}
                  disabled={activeIdx === flat.length - 1}
                >
                  Next lesson →
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/tutor">Ask AI tutor about this</Link>
                </Button>
                {completed.size === flat.length && (
                  <Button variant="hero" asChild>
                    <Link to="/certificate/$slug" params={{ slug: c.slug }}>
                      <Award className="mr-1.5 h-4 w-4" /> View certificate
                    </Link>
                  </Button>
                )}
              </div>

              <div className="mt-8 rounded-2xl glass border-border/60 p-5">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-mono uppercase tracking-wider text-primary">AI summary</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This lesson covers <span className="text-foreground font-medium">{active.lesson.title.toLowerCase()}</span>.
                  After watching, try the practice quiz in your dashboard — SkillCraft will adapt the next question based on what you miss.
                </p>
              </div>

              <div className="mt-5 rounded-2xl glass border-border/60 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <NotebookPen className="h-4 w-4 text-primary" />
                  <span className="text-xs font-mono uppercase tracking-wider text-primary">My notes</span>
                  <span className="text-xs text-muted-foreground ml-auto">Autosaved · per lesson</span>
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Jot key insights, timestamps, or questions for the AI tutor…"
                  className="w-full min-h-[120px] bg-background/40 border border-border/60 rounded-lg p-3 text-sm resize-y focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
          </div>

          <aside>
            <div className="sticky top-24 rounded-2xl bg-gradient-card border border-border/60 p-5">
              <div className="mb-5 p-4 rounded-xl border border-primary/30 bg-primary/5">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="h-4 w-4 text-primary" />
                  <span className="text-xs font-mono uppercase tracking-wider text-primary">Focus timer</span>
                </div>
                <div className="font-display text-3xl font-bold tabular-nums text-center">{mm}:{ss}</div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant={running ? "glow" : "hero"} className="flex-1" onClick={() => setRunning(!running)}>
                    {running ? <><Pause className="h-3.5 w-3.5 mr-1" /> Pause</> : <><Play className="h-3.5 w-3.5 mr-1" /> Start</>}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setRunning(false); setSecs(25 * 60); }}>
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <h2 className="font-display font-bold">Course content</h2>
                <span className="text-xs text-muted-foreground">{completed.size}/{flat.length}</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-5">
                <div className="h-full bg-gradient-primary transition-all" style={{ width: `${progress}%` }} />
              </div>

              <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
                {c.curriculum.map((mod, mi) => (
                  <div key={mi}>
                    <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                      M{String(mi + 1).padStart(2, "0")} · {mod.title}
                    </div>
                    <div className="space-y-1">
                      {mod.lessons.map((les, li) => {
                        const idx = flat.findIndex((f) => f.modIdx === mi && f.lesIdx === li);
                        const isActive = idx === activeIdx;
                        const isDone = completed.has(idx);
                        return (
                          <button
                            key={li}
                            onClick={() => setActiveIdx(idx)}
                            className={`w-full flex items-start gap-3 text-left p-2.5 rounded-lg transition-colors ${
                              isActive ? "bg-primary/10 border border-primary/40" : "hover:bg-muted/50 border border-transparent"
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                            ) : (
                              <PlayCircle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm leading-snug ${isActive ? "text-foreground font-medium" : "text-foreground/80"}`}>
                                {les.title}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">{les.duration}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {!user && (
                <Link to="/auth" className="mt-5 pt-5 border-t border-border/60 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
                  <Lock className="h-3.5 w-3.5" />
                  Sign in to save progress across devices
                </Link>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}