import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { TutorChat } from "@/components/site/TutorChat";

export const Route = createFileRoute("/tutor")({
  head: () => ({
    meta: [
      { title: "AI Tutor — SkillCraft" },
      { name: "description", content: "Chat with SkillCraft — your always-on AI tutor for CS, web development, ML, and system design." },
      { property: "og:title", content: "AI Tutor — SkillCraft" },
      { property: "og:description", content: "Always-on AI tutor for engineers, designers, and learners." },
    ],
  }),
  component: TutorPage,
});

function TutorPage() {
  return (
    <section className="relative pt-12 pb-24">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="relative mx-auto max-w-5xl px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 mb-5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium tracking-wide">Powered by SkillCraft AI · streams in real time</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tighter">
            Stuck? <span className="text-gradient">Ask anything.</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg">
            SkillCraft is a tutor who never sleeps. Ask for explanations, debug help, study plans, or interview prep — get answers in seconds.
          </p>
        </div>

        <TutorChat />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          AI can occasionally be wrong. Always verify critical information. Conversations may be used to improve the tutor.
        </p>
      </div>
    </section>
  );
}