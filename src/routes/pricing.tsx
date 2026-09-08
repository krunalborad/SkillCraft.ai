import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — SkillCraft" },
      { name: "description", content: "Simple, transparent pricing. Free trial, monthly, or lifetime access to all adaptive courses and the AI tutor." },
      { property: "og:title", content: "Pricing — SkillCraft" },
      { property: "og:description", content: "Adaptive learning that pays for itself. Plans for individuals and teams." },
    ],
  }),
  component: Pricing,
});

const tiers = [
  {
    name: "Explorer",
    price: "Free",
    desc: "Try the platform. No card required.",
    features: ["3 free lessons / course", "Limited AI tutor (10 msgs/day)", "Community access"],
    cta: "Start free",
    variant: "glow" as const,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    desc: "For serious learners shipping real projects.",
    features: [
      "All courses unlocked",
      "Unlimited AI tutor",
      "Adaptive learning paths",
      "Project reviews",
      "Verified certificates",
    ],
    cta: "Go Pro",
    variant: "hero" as const,
    featured: true,
  },
  {
    name: "Lifetime",
    price: "$299",
    desc: "Pay once. Learn forever. Best value.",
    features: ["Everything in Pro, forever", "Future courses included", "Priority AI access", "1:1 mentor session"],
    cta: "Buy lifetime",
    variant: "glow" as const,
  },
];

function Pricing() {
  return (
    <div className="relative">
      <section className="pt-16 pb-12">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <span className="inline-block text-xs font-mono uppercase tracking-widest text-primary mb-4">— Pricing —</span>
          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tighter max-w-3xl mx-auto leading-[1.05]">
            Plans that <span className="text-gradient">pay for themselves</span>
          </h1>
          <p className="mt-6 max-w-xl mx-auto text-lg text-muted-foreground">
            Simple, honest pricing. Cancel anytime. Refund within 14 days, no questions asked.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative rounded-3xl p-8 border ${
                t.featured
                  ? "border-primary/60 bg-gradient-card shadow-glow"
                  : "border-border/60 bg-gradient-card"
              }`}
            >
              {t.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Most popular
                </div>
              )}
              <h3 className="font-display text-xl font-bold">{t.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold text-gradient">{t.price}</span>
                {t.period && <span className="text-muted-foreground">{t.period}</span>}
              </div>
              <Button variant={t.variant} size="lg" className="w-full mt-6" asChild>
                <Link to="/courses">{t.cta}</Link>
              </Button>
              <ul className="mt-8 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}