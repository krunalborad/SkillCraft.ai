import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 p-12 md:p-20 text-center">
          <div className="absolute inset-0 bg-gradient-hero opacity-20" />
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-[40rem] bg-primary/30 blur-[100px] rounded-full" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-background/40 px-4 py-1.5 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium">Free 7-day trial · No card required</span>
            </div>

            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tighter max-w-3xl mx-auto leading-[1.05]">
              Stop watching tutorials.
              <br /><span className="text-gradient">Start actually learning.</span>
            </h2>

            <p className="mt-6 max-w-xl mx-auto text-muted-foreground text-lg">
              Join 120,000+ learners who chose adaptive over average.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button variant="hero" size="xl" asChild>
                <Link to="/courses">Get started free <ArrowRight /></Link>
              </Button>
              <Button variant="glow" size="xl" asChild>
                <Link to="/tutor">Talk to the AI tutor</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}