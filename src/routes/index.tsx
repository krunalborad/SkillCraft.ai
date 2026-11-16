import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { CoursesPreview } from "@/components/sections/CoursesPreview";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Testimonials } from "@/components/sections/Testimonials";
import { CtaBanner } from "@/components/sections/CtaBanner";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <Features />
      <CoursesPreview />
      <HowItWorks />
      <Testimonials />
      <CtaBanner />
    </>
  );
}