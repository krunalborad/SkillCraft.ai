const items = [
  { quote: "I'd tried four other platforms. SkillCraft's adaptive system is the first one that actually noticed I was weak at recursion and just… fixed it.", name: "Priya S.", role: "SDE @ Amazon" },
  { quote: "The AI tutor at 2am before my interview saved me. It explained dynamic programming in three different ways until something clicked.", name: "Tom A.", role: "Frontend Eng @ Stripe" },
  { quote: "Best $49 I've ever spent on my career. The system design course got me ready for staff-level interviews.", name: "Mei W.", role: "Staff Eng @ Notion" },
];

export function Testimonials() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-mono uppercase tracking-widest text-primary mb-3">— Loved by builders —</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight max-w-2xl mx-auto">
            People <span className="text-gradient">actually finish</span> SkillCraft courses
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <div key={i} className="rounded-2xl bg-gradient-card border border-border/60 p-7">
              <div className="text-4xl font-display text-primary leading-none mb-3">"</div>
              <p className="text-foreground/90 leading-relaxed mb-6">{t.quote}</p>
              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center font-display font-bold text-primary-foreground">
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}