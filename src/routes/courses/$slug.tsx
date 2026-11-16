import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Clock, Users, Star, BookOpen, Award, CheckCircle2, ArrowLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCourse, courses, type Course } from "@/lib/courses";
import { CourseCard } from "@/components/site/CourseCard";

export const Route = createFileRoute("/courses/$slug")({
  loader: ({ params }) => {
    const course = getCourse(params.slug);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => {
    const c = loaderData?.course;
    if (!c) return { meta: [{ title: "Course — SkillCraft" }] };
    return {
      meta: [
        { title: `${c.title} — SkillCraft` },
        { name: "description", content: c.description },
        { property: "og:title", content: `${c.title} — SkillCraft` },
        { property: "og:description", content: c.description },
      ],
    };
  },
  component: CourseDetail,
  notFoundComponent: () => (
    <div className="py-32 text-center">
      <h1 className="font-display text-3xl">Course not found</h1>
      <Link to="/courses" className="text-primary text-sm mt-4 inline-block">← Back to courses</Link>
    </div>
  ),
});

function CourseDetail() {
  const { course: c } = Route.useLoaderData() as { course: Course };
  const related = courses.filter((x) => x.slug !== c.slug && x.category === c.category).slice(0, 3);

  return (
    <div>
      <section className="relative overflow-hidden pt-12 pb-20">
        <div className={`absolute -top-40 right-0 h-[40rem] w-[40rem] rounded-full bg-gradient-to-br ${c.gradient} blur-[120px] opacity-50`} />
        <div className="relative mx-auto max-w-7xl px-6">
          <Link to="/courses" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" /> All courses
          </Link>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-medium uppercase tracking-wider text-primary">{c.category}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{c.level}</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tighter leading-[1.1]">{c.title}</h1>
              <p className="mt-4 text-xl text-muted-foreground">{c.tagline}</p>
              <p className="mt-6 text-foreground/80 leading-relaxed max-w-2xl">{c.description}</p>

              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" />{c.duration}</span>
                <span className="flex items-center gap-2 text-muted-foreground"><BookOpen className="h-4 w-4" />{c.lessons} lessons</span>
                <span className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" />{c.students.toLocaleString()} learners</span>
                <span className="flex items-center gap-2"><Star className="h-4 w-4 fill-warning text-warning" /><strong>{c.rating}</strong></span>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {c.tags.map((t) => (
                  <span key={t} className="text-xs px-3 py-1 rounded-full glass border-border/60">{t}</span>
                ))}
              </div>
            </div>

            <aside className="lg:col-span-1">
              <div className="sticky top-24 rounded-3xl bg-gradient-card border border-border/60 p-6 shadow-elegant">
                <div className="aspect-video rounded-xl overflow-hidden mb-5 border border-border/60 bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${c.curriculum[0]?.lessons[0]?.videoId}?rel=0&modestbranding=1`}
                    title={`Preview: ${c.title}`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="flex items-baseline gap-3 mb-2">
                  {c.price === 0 ? (
                    <>
                      <span className="font-display text-3xl font-bold text-gradient">Free</span>
                      <span className="text-xs text-success font-semibold uppercase tracking-wider">Full access</span>
                    </>
                  ) : (
                    <>
                      <span className="font-display text-3xl font-bold text-gradient">${c.price}</span>
                      {c.originalPrice && (
                        <>
                          <span className="text-muted-foreground line-through">${c.originalPrice}</span>
                          <span className="text-xs text-success font-semibold">
                            Save {Math.round((1 - c.price / c.originalPrice) * 100)}%
                          </span>
                        </>
                      )}
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-5">Lifetime access · Certificate included</p>
                <Button variant="hero" size="lg" className="w-full" asChild>
                  <Link to="/courses/$slug/watch" params={{ slug: c.slug }}>
                    <Play className="mr-1.5" /> Start watching
                  </Link>
                </Button>
                <Button variant="glow" size="lg" className="w-full mt-2" asChild>
                  <Link to="/learning-path">Build a learning path</Link>
                </Button>

                <div className="mt-6 pt-6 border-t border-border/60 space-y-3 text-sm">
                  {[
                    `${c.lessons} on-demand lessons`,
                    "AI tutor included",
                    "Adaptive practice & quizzes",
                    "Verified certificate",
                    "Lifetime updates",
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />{f}
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-3 gap-12">
          <div>
            <h2 className="font-display text-2xl font-bold mb-3">What you'll walk away with</h2>
            <p className="text-sm text-muted-foreground">Real, measurable outcomes — not vague promises.</p>
          </div>
          <div className="lg:col-span-2 grid gap-3">
            {c.outcomes.map((o, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl glass border-border/60">
                <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">{o}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-display text-3xl font-bold mb-10">Curriculum</h2>
          <div className="space-y-3 max-w-3xl">
            {c.curriculum.map((mod, i) => (
              <details key={i} className="group rounded-xl bg-gradient-card border border-border/60 overflow-hidden" open={i === 0}>
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-primary">M{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-display font-semibold">{mod.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{mod.lessons.length} lessons</span>
                </summary>
                <div className="px-5 pb-5 space-y-1">
                  {mod.lessons.map((l, j) => (
                    <Link
                      key={j}
                      to="/courses/$slug/watch"
                      params={{ slug: c.slug }}
                      className="flex items-center justify-between gap-3 text-sm text-muted-foreground py-2 px-2 -mx-2 rounded-lg hover:bg-muted/50 hover:text-foreground transition-colors"
                    >
                      <span className="flex items-center gap-3"><Play className="h-3.5 w-3.5 text-primary" />{l.title}</span>
                      <span className="text-xs">{l.duration}</span>
                    </Link>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-16 border-t border-border/50">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display text-3xl font-bold mb-10">More in {c.category}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((r) => <CourseCard key={r.slug} course={r} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}