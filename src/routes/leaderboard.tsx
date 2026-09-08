import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, Flame, Award, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — SkillCraft" },
      { name: "description", content: "Top learners on SkillCraft by XP, streaks, and certificates." },
    ],
  }),
  component: LeaderboardPage,
});

type Row = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  xp: number;
  current_streak: number;
  longest_streak: number;
};

function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, xp, current_streak, longest_streak")
        .order("xp", { ascending: false })
        .limit(50);
      setRows((data as Row[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="relative">
      <div className="absolute -top-40 right-0 h-[40rem] w-[40rem] rounded-full bg-gradient-primary blur-[120px] opacity-25 pointer-events-none" />
      <section className="relative pt-16 pb-10">
        <div className="mx-auto max-w-5xl px-6">
          <span className="text-xs font-mono uppercase tracking-widest text-primary">— Leaderboard —</span>
          <h1 className="mt-2 font-display text-5xl font-bold tracking-tighter">
            Top <span className="text-gradient">learners</span>
          </h1>
          <p className="mt-3 text-muted-foreground">Earn XP by completing lessons. 10 XP per lesson, 50 XP for a course, +5 daily streak bonus.</p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-6">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : rows.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">No learners yet — be the first!</div>
          ) : (
            <div className="space-y-2">
              {rows.map((r, i) => (
                <div
                  key={r.user_id}
                  className={`flex items-center gap-4 p-4 rounded-2xl border ${
                    i < 3 ? "bg-gradient-card border-primary/40" : "bg-gradient-card border-border/60"
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-display font-bold ${
                    i === 0 ? "bg-warning/20 text-warning" :
                    i === 1 ? "bg-muted text-foreground" :
                    i === 2 ? "bg-accent/20 text-accent" :
                    "bg-secondary text-muted-foreground"
                  }`}>
                    {i < 3 ? <Trophy className="h-5 w-5" /> : i + 1}
                  </div>
                  {r.avatar_url ? (
                    <img src={r.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                      {(r.display_name ?? "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold truncate">{r.display_name ?? "Anonymous"}</div>
                    <div className="text-xs text-muted-foreground flex gap-3 mt-0.5">
                      <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-warning" />{r.current_streak}d streak</span>
                      <span className="flex items-center gap-1"><Award className="h-3 w-3 text-accent" />best {r.longest_streak}d</span>
                    </div>
                  </div>
                  <div className="font-display text-2xl font-bold text-gradient tabular-nums">{r.xp.toLocaleString()}<span className="text-xs text-muted-foreground ml-1 font-sans font-normal">XP</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}