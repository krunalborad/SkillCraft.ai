import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TrendingUp, Flame, Target, Award, ArrowRight, Sparkles, Brain, Play, Trophy, Zap, Star, BookOpen, Rocket, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { courses } from "@/lib/courses";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SkillCraft" },
      { name: "description", content: "Track your learning progress, streaks, weak areas, and AI-personalized recommendations." },
    ],
  }),
  component: Dashboard,
});

const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ display_name: string | null; xp: number; current_streak: number; longest_streak: number } | null>(null);
  const [progressByCourse, setProgressByCourse] = useState<Record<string, number>>({});
  const [certCount, setCertCount] = useState(0);
  const [weekly, setWeekly] = useState<{ label: string; count: number }[]>([]);
  const [resume, setResume] = useState<{ courseSlug: string; courseTitle: string; lessonTitle: string; gradient: string } | null>(null);
  const [totalLessons, setTotalLessons] = useState(0);
  const [quizzes, setQuizzes] = useState<{ id: string; topic: string; difficulty: string; total: number; correct: number; created_at: string }[]>([]);
  const [solved, setSolved] = useState<{ id: string; challenge_title: string; difficulty: string; language: string; xp_earned: number; solved_at: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: prof }, { data: prog }, { count }, { data: recent }, { data: qz }, { data: sc }] = await Promise.all([
        supabase.from("profiles").select("display_name, xp, current_streak, longest_streak").eq("user_id", user.id).maybeSingle(),
        supabase.from("lesson_progress").select("course_slug, completed_at").eq("user_id", user.id),
        supabase.from("certificates").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("lesson_progress").select("course_slug, lesson_id, completed_at").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(1),
        supabase.from("quiz_attempts").select("id, topic, difficulty, total, correct, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
        supabase.from("solved_challenges").select("id, challenge_title, difficulty, language, xp_earned, solved_at").eq("user_id", user.id).order("solved_at", { ascending: false }).limit(50),
      ]);
      setProfile(prof as any);
      const counts: Record<string, number> = {};
      (prog ?? []).forEach((p: any) => { counts[p.course_slug] = (counts[p.course_slug] ?? 0) + 1; });
      setProgressByCourse(counts);
      setCertCount(count ?? 0);
      setTotalLessons((prog ?? []).length);
      setQuizzes((qz ?? []) as any);
      setSolved((sc ?? []) as any);

      // Build last-7-days activity from all activity timestamps
      const today = new Date();
      const buckets: { label: string; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        d.setHours(0, 0, 0, 0);
        buckets.push({ label: dayLabels[d.getDay()], count: 0 });
      }
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - 6);
      startOfWeek.setHours(0, 0, 0, 0);
      const stamps = [
        ...(prog ?? []).map((p: any) => p.completed_at),
        ...(qz ?? []).map((q: any) => q.created_at),
        ...(sc ?? []).map((s: any) => s.solved_at),
      ];
      stamps.forEach((ts: string) => {
        const dt = new Date(ts);
        const diff = Math.floor((dt.getTime() - startOfWeek.getTime()) / 86400000);
        if (diff >= 0 && diff < 7) buckets[diff].count += 1;
      });
      setWeekly(buckets);

      // Resume last lesson
      if (recent && recent.length > 0) {
        const r: any = recent[0];
        const course = courses.find((c) => c.slug === r.course_slug);
        if (course) {
          let lessonTitle = "Continue where you left off";
          for (const m of course.curriculum) {
            const found = m.lessons.find((l) => l.videoId === r.lesson_id);
            if (found) { lessonTitle = found.title; break; }
          }
          setResume({ courseSlug: course.slug, courseTitle: course.title, lessonTitle, gradient: course.gradient });
        }
      }
    })();
  }, [user]);

  const inProgress = courses
    .map((c) => ({ course: c, done: progressByCourse[c.slug] ?? 0 }))
    .filter((x) => x.done > 0)
    .map((x) => ({ ...x, progress: Math.round((x.done / x.course.lessons) * 100) }))
    .slice(0, 5);

  const xp = profile?.xp ?? 0;
  const streak = profile?.current_streak ?? 0;
  const longest = profile?.longest_streak ?? 0;
  const coursesCompleted = certCount;
  const badges = [
    { id: "first-step", label: "First Step", desc: "Complete your first lesson", icon: Play, earned: totalLessons >= 1 },
    { id: "scholar", label: "Scholar", desc: "Complete 10 lessons", icon: BookOpen, earned: totalLessons >= 10 },
    { id: "marathoner", label: "Marathoner", desc: "Complete 50 lessons", icon: Rocket, earned: totalLessons >= 50 },
    { id: "spark", label: "Spark", desc: "3-day streak", icon: Zap, earned: longest >= 3 },
    { id: "on-fire", label: "On Fire", desc: "7-day streak", icon: Flame, earned: longest >= 7 },
    { id: "unstoppable", label: "Unstoppable", desc: "30-day streak", icon: Trophy, earned: longest >= 30 },
    { id: "graduate", label: "Graduate", desc: "Earn your first certificate", icon: Award, earned: coursesCompleted >= 1 },
    { id: "polymath", label: "Polymath", desc: "Earn 3 certificates", icon: Star, earned: coursesCompleted >= 3 },
    { id: "quizzer", label: "Quizzer", desc: "Complete 5 quizzes", icon: Target, earned: quizzes.length >= 5 },
    { id: "coder", label: "Problem Solver", desc: "Solve 5 code challenges", icon: Brain, earned: solved.length >= 5 },
    { id: "xp-100", label: "Rising Star", desc: "Reach 100 XP", icon: Sparkles, earned: xp >= 100 },
    { id: "xp-1000", label: "XP Master", desc: "Reach 1,000 XP", icon: Trophy, earned: xp >= 1000 },
  ];
  const earnedCount = badges.filter((b) => b.earned).length;
  const max = Math.max(1, ...weekly.map((w) => w.count));

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6 py-20">
        <div className="max-w-md text-center">
          <h1 className="font-display text-4xl font-bold tracking-tighter">Sign in to see your <span className="text-gradient">dashboard</span></h1>
          <p className="mt-3 text-muted-foreground">Track XP, streaks, certificates, and personalized AI insights.</p>
          <Button variant="hero" size="lg" className="mt-6" asChild>
            <Link to="/auth">Sign in / Create account</Link>
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="relative">
      <section className="pt-12 pb-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-primary">— Welcome back —</span>
              <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold tracking-tighter">
                Hey, <span className="text-gradient">{profile?.display_name ?? user.email?.split("@")[0]}</span>
              </h1>
              <p className="mt-2 text-muted-foreground">{profile?.xp ?? 0} XP · keep your streak alive today.</p>
            </div>
            <Button variant="hero" size="lg" asChild>
              <Link to="/courses">Continue learning <ArrowRight /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="pb-8">
        <div className="mx-auto max-w-7xl px-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { icon: Flame, label: "Day streak", value: String(profile?.current_streak ?? 0), trend: `Best: ${profile?.longest_streak ?? 0}d`, color: "text-warning" },
            { icon: Sparkles, label: "Total XP", value: (profile?.xp ?? 0).toLocaleString(), trend: "Lessons, quizzes & challenges", color: "text-primary" },
            { icon: Target, label: "Lessons done", value: String(Object.values(progressByCourse).reduce((a, b) => a + b, 0)), trend: `${inProgress.length} courses active`, color: "text-success" },
            { icon: Brain, label: "Quizzes taken", value: String(quizzes.length), trend: quizzes.length ? `${Math.round((quizzes.reduce((a, q) => a + q.correct, 0) / Math.max(1, quizzes.reduce((a, q) => a + q.total, 0))) * 100)}% average` : "Try one today", color: "text-primary" },
            { icon: Zap, label: "Challenges solved", value: String(solved.length), trend: solved.length ? `+${solved.reduce((a, s) => a + s.xp_earned, 0)} XP earned` : "Open Code Lab", color: "text-warning" },
            { icon: Award, label: "Certificates", value: String(certCount), trend: certCount ? "Earned" : "Complete a course", color: "text-accent" },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl bg-gradient-card border border-border/60 p-5">
              <div className="flex items-center justify-between">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="mt-4 font-display text-3xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              <div className="text-xs text-muted-foreground/70 mt-2">{s.trend}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-8">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-gradient-card border border-border/60 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-bold">Learning activity</h2>
              <span className="text-xs text-muted-foreground">Last 7 days</span>
            </div>
            <div className="flex items-end gap-3 h-48">
              {weekly.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex-1 flex items-end relative group">
                    <div
                      className="w-full rounded-t-lg bg-gradient-primary shadow-glow transition-all min-h-[4px]"
                      style={{ height: `${v.count === 0 ? 4 : (v.count / max) * 100}%`, opacity: v.count === 0 ? 0.2 : 1 }}
                    />
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">{v.count}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{v.label}</span>
                </div>
              ))}
            </div>
          </div>

          {resume ? (
            <div className="rounded-2xl bg-gradient-card border border-primary/30 p-6 relative overflow-hidden flex flex-col">
              <div className={`absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br ${resume.gradient} blur-3xl opacity-60`} />
              <div className="relative flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3">
                  <Play className="h-4 w-4 text-primary" />
                  <span className="text-xs font-mono uppercase tracking-wider text-primary">Pick up where you left off</span>
                </div>
                <h3 className="font-display text-lg font-bold leading-snug">{resume.courseTitle}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">{resume.lessonTitle}</p>
                <div className="flex-1" />
                <Button variant="glow" size="sm" className="mt-5 w-full" asChild>
                  <Link to="/courses/$slug/watch" params={{ slug: resume.courseSlug }}>Resume lesson <ArrowRight className="h-3.5 w-3.5" /></Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-gradient-card border border-primary/30 p-6 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-mono uppercase tracking-wider text-primary">Get started</span>
                </div>
                <h3 className="font-display text-lg font-bold leading-snug">Start your first lesson</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">Pick a course from the catalog and the resume card will guide you back here next time.</p>
                <Button variant="glow" size="sm" className="mt-5 w-full" asChild>
                  <Link to="/courses">Browse courses <ArrowRight className="h-3.5 w-3.5" /></Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="pb-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-2xl bg-gradient-card border border-border/60 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-lg font-bold">Achievements</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{earnedCount} of {badges.length} unlocked</p>
              </div>
              <div className="text-xs font-mono text-primary">{Math.round((earnedCount / badges.length) * 100)}%</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className={`group relative rounded-xl border p-4 text-center transition-all ${
                    b.earned
                      ? "border-primary/40 bg-gradient-to-br from-primary/10 to-transparent hover:border-primary/70 hover:-translate-y-0.5"
                      : "border-border/40 bg-secondary/30 opacity-60"
                  }`}
                  title={b.desc}
                >
                  <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${b.earned ? "bg-gradient-primary shadow-glow" : "bg-secondary"}`}>
                    {b.earned ? <b.icon className="h-5 w-5 text-primary-foreground" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="mt-2 text-xs font-display font-semibold truncate">{b.label}</div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground line-clamp-2 leading-tight">{b.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-8">
        <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-gradient-card border border-border/60 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold">Recent quizzes</h2>
              <Link to="/quiz" className="text-xs text-primary hover:underline">Take a quiz →</Link>
            </div>
            {quizzes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No quizzes yet. Your scores will show up here after you submit one.</p>
            ) : (
              <div className="space-y-3">
                {quizzes.slice(0, 5).map((q) => (
                  <div key={q.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-secondary/20 p-3">
                    <Target className="h-4 w-4 text-success flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{q.topic}</div>
                      <div className="text-xs text-muted-foreground">{q.difficulty} · {new Date(q.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="font-mono text-sm">{q.correct}/{q.total}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-gradient-card border border-border/60 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold">Solved challenges</h2>
              <Link to="/playground" className="text-xs text-primary hover:underline">Open Code Lab →</Link>
            </div>
            {solved.length === 0 ? (
              <p className="text-sm text-muted-foreground">No challenges solved yet. Accepted solutions in Code Lab appear here with the XP they earned.</p>
            ) : (
              <div className="space-y-3">
                {solved.slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-secondary/20 p-3">
                    <Zap className="h-4 w-4 text-warning flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{s.challenge_title}</div>
                      <div className="text-xs text-muted-foreground">{s.difficulty} · {s.language} · {new Date(s.solved_at).toLocaleDateString()}</div>
                    </div>
                    <div className="font-mono text-sm text-primary">+{s.xp_earned}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>


      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-display text-2xl font-bold mb-6">In progress</h2>
          {inProgress.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-gradient-card p-8 text-center text-muted-foreground">
              No courses started yet. <Link to="/courses" className="text-primary hover:underline">Browse the catalog →</Link>
            </div>
          ) : (
          <div className="space-y-4">
            {inProgress.map((e, i) => (
              <Link
                key={i}
                to="/courses/$slug"
                params={{ slug: e.course.slug }}
                className="group flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-2xl bg-gradient-card border border-border/60 hover:border-primary/50 transition-all"
              >
                <div className={`hidden md:flex h-16 w-16 rounded-xl bg-gradient-to-br ${e.course.gradient} items-center justify-center flex-shrink-0`}>
                  <Brain className="h-7 w-7 text-foreground/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-primary uppercase tracking-wider font-medium">{e.course.category}</span>
                  </div>
                  <h3 className="font-display font-bold truncate group-hover:text-gradient transition-all">{e.course.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{e.done} of {e.course.lessons} lessons complete</p>
                </div>
                <div className="md:w-64">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">{e.progress}% complete</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-gradient-primary" style={{ width: `${e.progress}%` }} />
                  </div>
                </div>
                <ArrowRight className="hidden md:block h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
          )}
        </div>
      </section>
    </div>
  );
}
