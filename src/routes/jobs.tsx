import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Briefcase, Loader2, MapPin, Search, X, Wand2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { jobs, JOB_CATEGORIES, type Job } from "@/lib/jobs";
import { writeCoverLetter } from "@/lib/career.functions";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Jobs & Internships — SkillCraft" },
      {
        name: "description",
        content: "Browse curated engineering, data, design and QA roles, filter by remote, level and type, and generate a tailored cover letter with AI.",
      },
      { property: "og:title", content: "Jobs & Internships — SkillCraft" },
      { property: "og:description", content: "Curated tech roles with an AI cover letter writer built in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JobsPage,
});

const MODES = ["Remote", "Hybrid", "On-site"] as const;
const TYPES = ["Full-time", "Internship", "Contract"] as const;
const LEVELS = ["Entry", "Mid", "Senior"] as const;
const TONES = ["professional", "enthusiastic", "concise"];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function JobsPage() {
  const letterFn = useServerFn(writeCoverLetter);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [mode, setMode] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);

  const [selected, setSelected] = useState<Job | null>(null);
  const [profile, setProfile] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return jobs.filter((j) => {
      if (category && j.category !== category) return false;
      if (mode && j.mode !== mode) return false;
      if (type && j.type !== type) return false;
      if (level && j.level !== level) return false;
      if (!term) return true;
      return (
        j.title.toLowerCase().includes(term) ||
        j.company.toLowerCase().includes(term) ||
        j.location.toLowerCase().includes(term) ||
        j.skills.some((s) => s.toLowerCase().includes(term))
      );
    });
  }, [q, category, mode, type, level]);

  const clearAll = () => {
    setQ("");
    setCategory(null);
    setMode(null);
    setType(null);
    setLevel(null);
  };

  const generate = async () => {
    if (!selected) return;
    setLoading(true);
    setLetter("");
    try {
      const r = await letterFn({
        data: {
          jobTitle: selected.title,
          company: selected.company,
          jobSummary: `${selected.summary} Skills: ${selected.skills.join(", ")}. Level: ${selected.level}. ${selected.mode} in ${selected.location}.`,
          profile,
          tone,
        },
      });
      setLetter(r.letter);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not write the letter");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <Briefcase className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Jobs &amp; Internships</h1>
          <p className="text-sm text-muted-foreground">
            Curated roles across engineering, data, design and QA — with an AI cover letter writer for each one.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10 pr-10"
              placeholder="Search role, company, skill or city"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {q && (
              <button
                onClick={() => setQ("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button variant="ghost" onClick={clearAll}>
            Reset
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {JOB_CATEGORIES.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(category === c ? null : c)}>
              {c}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <Chip key={m} active={mode === m} onClick={() => setMode(mode === m ? null : m)}>
              {m}
            </Chip>
          ))}
          {TYPES.map((t) => (
            <Chip key={t} active={type === t} onClick={() => setType(type === t ? null : t)}>
              {t}
            </Chip>
          ))}
          {LEVELS.map((l) => (
            <Chip key={l} active={level === l} onClick={() => setLevel(level === l ? null : l)}>
              {l} level
            </Chip>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "role" : "roles"} found
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((j) => (
          <div key={j.id} className="rounded-2xl border border-border/60 p-6 transition-colors hover:border-primary/50">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border font-display text-sm font-bold">
                {j.logo}
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-semibold leading-tight">{j.title}</h3>
                <p className="text-sm text-muted-foreground">{j.company}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {j.location}
              </span>
              <span>· {j.mode}</span>
              <span>· {j.type}</span>
            </div>

            <p className="mt-4 text-sm text-muted-foreground line-clamp-3">{j.summary}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {j.skills.slice(0, 4).map((s) => (
                <span key={s} className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{j.salary}</p>
                <p className="text-xs text-muted-foreground">{j.posted}</p>
              </div>
              <Button
                variant="hero"
                size="sm"
                onClick={() => {
                  setSelected(j);
                  setLetter("");
                }}
              >
                <Wand2 className="h-4 w-4" />
                Cover letter
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-16 text-center text-muted-foreground">No roles match those filters. Try resetting them.</p>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-4 backdrop-blur-sm md:items-center">
          <div className="glass max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold">Cover letter</h2>
                <p className="text-sm text-muted-foreground">
                  {selected.title} · {selected.company}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelected(null)} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-medium">Your background</label>
                <Textarea
                  className="mt-2 min-h-28"
                  placeholder="Final-year CS student, built a React dashboard used by 2,000 users, interned at..."
                  value={profile}
                  onChange={(e) => setProfile(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <Chip key={t} active={tone === t} onClick={() => setTone(t)}>
                    {t}
                  </Chip>
                ))}
              </div>
              <Button variant="hero" disabled={loading || !profile.trim()} onClick={generate}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                Write my letter
              </Button>

              {letter && (
                <div className="rounded-xl border border-border/60 p-5">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{letter}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      navigator.clipboard.writeText(letter);
                      toast.success("Copied to clipboard");
                    }}
                  >
                    <Copy className="h-4 w-4" /> Copy
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}