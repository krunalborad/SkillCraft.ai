import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero.jpg";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-32">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute inset-0" style={{ background: "var(--gradient-glow)" }} />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 mb-6 animate-glow">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium tracking-wide">Powered by adaptive AI · v2 launched</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tighter">
              Learn what you need.
              <br />
              <span className="text-gradient">Skip what you don't.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
              SkillCraft is the e-learning platform that adapts to <em>you</em> — not the average student.
              An AI tutor watches your progress, finds your weak spots, and rewrites your learning path in real time.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button variant="hero" size="xl" asChild>
                <Link to="/courses">Browse courses <ArrowRight className="ml-1" /></Link>
              </Button>
              <Button variant="glow" size="xl" asChild>
                <Link to="/tutor"><Play className="mr-1" /> Try the AI tutor</Link>
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-8 text-sm">
              <div>
                <div className="font-display text-2xl font-bold text-foreground">120k+</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Active learners</div>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <div className="font-display text-2xl font-bold text-foreground">94%</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Completion rate</div>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <div className="font-display text-2xl font-bold text-foreground">4.9★</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Avg. rating</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative animate-float">
              <div className="absolute -inset-4 bg-gradient-primary rounded-3xl blur-2xl opacity-30 animate-glow" />
              <img
                src={heroImg}
                alt="AI-powered learning visualization"
                width={1920}
                height={1280}
                className="relative rounded-3xl border border-border/60 shadow-elegant"
              />
            </div>

            {/* Floating cards */}
            <div className="hidden md:block absolute -left-8 top-1/4 glass rounded-xl p-4 shadow-card animate-float" style={{ animationDelay: "1s" }}>
              <div className="text-xs text-muted-foreground">Recommended next</div>
              <div className="text-sm font-semibold mt-1">Dynamic Programming</div>
              <div className="mt-2 h-1.5 w-32 bg-secondary rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-primary" />
              </div>
            </div>

            <div className="hidden md:block absolute -right-4 bottom-8 glass rounded-xl p-4 shadow-card animate-float" style={{ animationDelay: "2s" }}>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <div className="text-xs text-muted-foreground">Streak</div>
              </div>
              <div className="text-2xl font-display font-bold mt-1">17 days 🔥</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}