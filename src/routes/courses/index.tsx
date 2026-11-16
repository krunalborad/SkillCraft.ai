import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { CourseCard } from "@/components/site/CourseCard";
import { courses } from "@/lib/courses";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "All Courses — SkillCraft" },
      { name: "description", content: "Browse adaptive, AI-personalized courses on CS, web development, machine learning, system design, and product." },
      { property: "og:title", content: "All Courses — SkillCraft" },
      { property: "og:description", content: "Adaptive, AI-personalized courses for engineers, designers, and builders." },
    ],
  }),
  component: CoursesPage,
});

const categories = [
  "All",
  "Algorithms",
  "Full-Stack",
  "Frontend",
  "Python",
  "Machine Learning",
  "Data Science",
  "System Design",
  "Cloud / AWS",
  "UI/UX Design",
  "Git & Workflow",
];

const levels = ["All levels", "Beginner", "Intermediate", "Advanced"] as const;

function CoursesPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [level, setLevel] = useState<(typeof levels)[number]>("All levels");

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchesCat = cat === "All" || c.category === cat;
      const matchesLevel = level === "All levels" || c.level === level;
      const matchesQ = !q || (c.title + c.tagline + c.tags.join(" ")).toLowerCase().includes(q.toLowerCase());
      return matchesCat && matchesLevel && matchesQ;
    });
  }, [q, cat, level]);

  return (
    <div className="relative">
      <section className="pt-16 pb-10">
        <div className="mx-auto max-w-7xl px-6">
          <span className="inline-block text-xs font-mono uppercase tracking-widest text-primary mb-4">— Course catalog —</span>
          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tighter max-w-3xl">
            Pick a path. <span className="text-gradient">We'll personalize the rest.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            {courses.length} courses, all adaptive, all project-based. Filter by what you want to build next.
          </p>

          <div className="mt-10 space-y-5">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search courses, topics, instructors..."
                  className="w-full bg-input border border-border/60 rounded-xl pl-11 pr-10 py-3 text-sm focus:outline-none focus:border-primary/60"
                />
                {q && (
                  <button
                    onClick={() => setQ("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex gap-1 p-1 rounded-xl border border-border/60 bg-input/50">
                {levels.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      level === l
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    cat === c
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              Showing <span className="text-foreground font-medium">{filtered.length}</span> of {courses.length} courses
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6">
          {filtered.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">No courses match — try a different search.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((c) => <CourseCard key={c.slug} course={c} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}