import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — SkillCraft" },
      {
        name: "description",
        content:
          "Sign in or create your SkillCraft account to track progress, earn certificates, and climb the leaderboard.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: name },
          },
        });

        if (error) throw error;

        toast.success("Account created — welcome!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err.message ?? "Auth failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[40rem] w-[40rem] rounded-full bg-gradient-primary blur-[120px] opacity-30 pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl bg-gradient-card border border-border/60 p-8 shadow-elegant">
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>

          <span className="font-display text-xl font-bold">
            SkillCraft<span className="text-gradient">.ai</span>
          </span>
        </Link>

        <h1 className="font-display text-3xl font-bold tracking-tight">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>

        <form onSubmit={submit} className="space-y-3 mt-6">
          {mode === "signup" && (
            <input
              required
              placeholder="Display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-input border border-border/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60"
            />
          )}

          <input
            required
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-input border border-border/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60"
          />

          <input
            required
            minLength={6}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-input border border-border/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60"
          />

          <Button
            variant="hero"
            type="submit"
            className="w-full"
            disabled={busy}
          >
            {busy && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() =>
            setMode(mode === "signin" ? "signup" : "signin")
          }
          className="mt-5 text-sm text-muted-foreground hover:text-foreground w-full text-center"
        >
          {mode === "signin"
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
