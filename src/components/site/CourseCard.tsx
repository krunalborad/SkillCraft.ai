import { Link } from "@tanstack/react-router";
import { Clock, Users, Star, ArrowUpRight, PlayCircle } from "lucide-react";
import type { Course } from "@/lib/courses";

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      to="/courses/$slug"
      params={{ slug: course.slug }}
      className="group relative block overflow-hidden rounded-2xl bg-gradient-card border border-border/60 p-6 transition-all duration-500 hover:border-primary/50 hover:shadow-glow hover:-translate-y-1"
    >
      <div className={`absolute -top-20 -right-20 h-48 w-48 rounded-full bg-gradient-to-br ${course.gradient} blur-3xl opacity-60 transition-opacity group-hover:opacity-100`} />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium uppercase tracking-wider text-primary">{course.category}</span>
          <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-all group-hover:text-primary group-hover:rotate-45" />
        </div>

        <h3 className="font-display text-xl font-bold leading-tight mb-2 group-hover:text-gradient transition-all">
          {course.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-5">{course.tagline}</p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5">
          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{course.duration}</span>
          <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{(course.students / 1000).toFixed(1)}k</span>
          <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-warning text-warning" />{course.rating}</span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            <span className="text-foreground font-medium">{course.instructor.name}</span> · {course.level}
          </div>
          <div className="text-right">
            {course.price === 0 ? (
              <span className="inline-flex items-center gap-1 text-sm font-display font-bold text-success">
                <PlayCircle className="h-4 w-4" /> Free
              </span>
            ) : (
              <>
                <span className="text-lg font-display font-bold text-primary">${course.price}</span>
                {course.originalPrice && (
                  <span className="text-xs text-muted-foreground line-through ml-1.5">${course.originalPrice}</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}