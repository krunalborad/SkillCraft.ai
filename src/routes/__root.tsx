import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { AuthProvider } from "@/hooks/use-auth";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-32">
        <div className="max-w-md text-center">
          <h1 className="font-display text-8xl font-bold text-gradient">404</h1>
          <h2 className="mt-4 text-xl font-display font-semibold">Lost in the syllabus</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This page hasn't been written yet — or it moved on to bigger things.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            Back home
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SkillCraft — Adaptive AI learning platform" },
      { name: "description", content: "SkillCraft is the e-learning platform that adapts to you. AI tutor, weak-spot detection, and project-based courses for engineers, designers, and creators." },
      { name: "author", content: "SkillCraft" },
      { property: "og:title", content: "SkillCraft — Adaptive AI learning platform" },
      { property: "og:description", content: "Learn what you need. Skip what you don't. Adaptive courses powered by an AI tutor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@skillcraft" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <Toaster />
      </div>
    </AuthProvider>
  );
}