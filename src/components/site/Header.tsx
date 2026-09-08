import { Link, useNavigate } from "@tanstack/react-router";
import { Brain, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const nav = [
    { to: "/courses", label: "Courses" },
    { to: "/learning-path", label: "AI Path" },
    { to: "/quiz", label: "Quiz" },
    { to: "/playground", label: "Code Lab" },
    { to: "/mock-interview", label: "Interview" },
    { to: "/resume", label: "Resume" },
    { to: "/jobs", label: "Jobs" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/tutor", label: "AI Tutor" },
  ] as const;


  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="absolute inset-0 glass border-b border-border/50" />
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow transition-transform group-hover:scale-110">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            SkillCraft<span className="text-gradient">.ai</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-5">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">{user.email?.split("@")[0]}</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/auth">Get started</Link>
              </Button>
            </>
          )}
        </div>

        <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden glass border-t border-border/50 px-6 py-4 space-y-3">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="block py-2 text-sm font-medium" onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
          {user ? (
            <Button variant="ghost" size="sm" className="w-full" onClick={async () => { await signOut(); setOpen(false); }}>
              Sign out
            </Button>
          ) : (
            <Button variant="hero" size="sm" className="w-full" asChild>
              <Link to="/auth" onClick={() => setOpen(false)}>Sign in</Link>
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
