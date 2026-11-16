const steps = [
  { num: "01", title: "Pick a course", desc: "Or let our AI suggest one based on your goals and current skills." },
  { num: "02", title: "Learn & practice", desc: "Watch lessons, take quizzes, run code. The system tracks every interaction." },
  { num: "03", title: "AI adapts in real time", desc: "Weak spots get reinforced. Strong areas get skipped. Your path becomes uniquely yours." },
  { num: "04", title: "Ship your project", desc: "End every course with a real, portfolio-worthy project. Get a verified certificate." },
];

export function HowItWorks() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-mono uppercase tracking-widest text-primary mb-3">— How it works —</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            From novice to <span className="text-gradient">job-ready</span> in four steps
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="relative">
              <div className="font-display text-7xl font-bold text-gradient opacity-50 leading-none">{s.num}</div>
              <h3 className="font-display text-xl font-bold mt-4">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 -right-3 w-6 h-px bg-gradient-to-r from-primary/50 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}