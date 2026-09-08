import { Link } from "@tanstack/react-router";
import { Brain, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">
                SkillCraft<span className="text-gradient">.ai</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              The adaptive learning platform that thinks with you. Built for the next generation of engineers, designers, and creators.
            </p>
            <div className="mt-6 flex gap-3">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:border-primary/60 hover:text-primary transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold mb-4">Learn</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/courses" className="hover:text-foreground">All courses</Link></li>
              <li><Link to="/tutor" className="hover:text-foreground">AI Tutor</Link></li>
              <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
              <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold mb-4">Career</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/mock-interview" className="hover:text-foreground">Mock Interview</Link></li>
              <li><Link to="/resume" className="hover:text-foreground">Resume Builder</Link></li>
              <li><Link to="/jobs" className="hover:text-foreground">Jobs &amp; Internships</Link></li>
              <li><Link to="/leaderboard" className="hover:text-foreground">Leaderboard</Link></li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">© 2026 SkillCraft — Built for learners who don't settle.</p>
          <p className="text-xs text-muted-foreground">Made with intent in Stockholm</p>
        </div>
      </div>
    </footer>
  );
}
