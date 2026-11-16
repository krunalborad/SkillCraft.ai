import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCourse, type Course } from "@/lib/courses";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/certificate/$slug")({
  loader: ({ params }) => {
    const course = getCourse(params.slug);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `Certificate: ${loaderData?.course?.title ?? ""} — SkillCraft` }],
  }),
  component: CertPage,
});

function CertPage() {
  const { course } = Route.useLoaderData() as { course: Course };
  const { user } = useAuth();
  const [name, setName] = useState<string>("");
  const [issued, setIssued] = useState<string>(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));
  const certId = `LUM-${course.slug.toUpperCase().slice(0, 6)}-${(user?.id ?? "guest").slice(0, 6).toUpperCase()}`;

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: prof } = await supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle();
      setName(prof?.display_name ?? user.email?.split("@")[0] ?? "Learner");
      const { data: cert } = await supabase.from("certificates").select("issued_at").eq("user_id", user.id).eq("course_slug", course.slug).maybeSingle();
      if (cert?.issued_at) {
        setIssued(new Date(cert.issued_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));
      }
    })();
  }, [user, course.slug]);

  return (
    <div className="relative py-12">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link to="/courses/$slug" params={{ slug: course.slug }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to course
          </Link>
          <Button variant="hero" onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-1.5" /> Download / Print
          </Button>
        </div>

        <div className="relative aspect-[1.414/1] rounded-3xl border-[3px] border-primary/40 bg-gradient-card overflow-hidden shadow-elegant print:border-primary print:shadow-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-accent/20 blur-3xl" />

          <div className="relative h-full flex flex-col items-center justify-center text-center px-12 py-10">
            <div className="flex items-center gap-2 text-primary">
              <Award className="h-7 w-7" />
              <span className="font-display text-2xl font-bold">SkillCraft<span className="text-gradient">.ai</span></span>
            </div>
            <p className="mt-8 text-xs uppercase tracking-[0.4em] text-muted-foreground">Certificate of Completion</p>
            <p className="mt-6 text-sm text-muted-foreground">This certifies that</p>
            <h1 className="mt-3 font-display text-5xl md:text-6xl font-bold tracking-tighter">
              {name || "Your Name"}
            </h1>
            <p className="mt-6 text-sm text-muted-foreground max-w-xl">has successfully completed the course</p>
            <h2 className="mt-3 font-display text-2xl md:text-3xl font-bold text-gradient max-w-2xl">{course.title}</h2>
            <p className="mt-4 text-sm text-muted-foreground max-w-xl">{course.lessons} lessons · {course.duration} · {course.category}</p>

            <div className="mt-auto pt-10 grid grid-cols-3 gap-12 w-full max-w-2xl text-xs">
              <div>
                <div className="font-mono text-foreground">{issued}</div>
                <div className="mt-1 uppercase tracking-wider text-muted-foreground">Issued</div>
              </div>
              <div>
                <div className="font-display font-bold text-gradient">SkillCraft</div>
                <div className="mt-1 uppercase tracking-wider text-muted-foreground">Issued by</div>
              </div>
              <div>
                <div className="font-mono text-foreground">{certId}</div>
                <div className="mt-1 uppercase tracking-wider text-muted-foreground">Verify ID</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}