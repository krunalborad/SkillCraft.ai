import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/site/CourseCard";
import { courses } from "@/lib/courses";

export function CoursesPreview() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <span className="inline-block text-xs font-mono uppercase tracking-widest text-primary mb-3">— Trending now —</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight max-w-xl">
              Courses that <span className="text-gradient">don't waste your time</span>
            </h2>
          </div>
          <Button variant="glow" asChild>
            <Link to="/courses">View all <ArrowRight /></Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.slice(0, 6).map((c) => (
            <CourseCard key={c.slug} course={c} />
          ))}
        </div>
      </div>
    </section>
  );
}