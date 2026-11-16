import { Brain, Target, MessageSquare, TrendingUp, Code2, Award } from "lucide-react";

const features = [
  { icon: Brain, title: "Adaptive learning paths", desc: "The AI rewrites your curriculum after every quiz. No more grinding what you already know." },
  { icon: Target, title: "Weak-spot detection", desc: "Got Recursion wrong twice? Tomorrow's plan opens with Recursion — explained a different way." },
  { icon: MessageSquare, title: "AI tutor that gets you", desc: "Stuck at 2am? Ask anything. Get clear, contextual explanations grounded in your course." },
  { icon: Code2, title: "Built-in code playground", desc: "Run, test, and get AI feedback on your solutions — without leaving the lesson." },
  { icon: TrendingUp, title: "Real progress analytics", desc: "Beautiful graphs show what you actually learned this week — not just what you watched." },
  { icon: Award, title: "Verified certificates", desc: "Auto-generated, signed, and shareable. Real proof of skill, not just attendance." },
];

export function Features() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="inline-block text-xs font-mono uppercase tracking-widest text-primary mb-4">— What makes SkillCraft different —</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Six features. <span className="text-gradient">Zero fluff.</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            We didn't ship 50 half-baked things. We built the six features that actually move the needle on how fast you learn.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl bg-gradient-card border border-border/60 p-7 transition-all hover:border-primary/40 hover:-translate-y-1"
            >
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary shadow-glow mb-5">
                  <f.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}