import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, FileText, Sparkles, Copy, Gauge, ListChecks, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { writeResumeSummary, improveBullets, scoreResume } from "@/lib/career.functions";
import { extractResumeText, ACCEPTED } from "@/lib/resume-file";


export const Route = createFileRoute("/resume")({
  head: () => ({
    meta: [
      { title: "AI Resume Builder — SkillCraft" },
      {
        name: "description",
        content: "Write ATS-friendly resume summaries, rewrite bullet points with measurable impact, and score your resume against any job description.",
      },
      { property: "og:title", content: "AI Resume Builder — SkillCraft" },
      { property: "og:description", content: "Summaries, impact bullets and an instant ATS score for your resume." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResumePage,
});

const TABS = [
  { id: "summary", label: "Summary writer", icon: Sparkles },
  { id: "bullets", label: "Impact bullets", icon: ListChecks },
  { id: "score", label: "ATS score", icon: Gauge },
] as const;

const TONES = ["confident", "concise", "creative", "formal"];
const ROLES = [
  "Frontend Engineer",
  "Backend Engineer",
  "Full-Stack Engineer",
  "Data Analyst",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Product Designer",
  "QA Engineer",
];

function copy(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
        active
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function ResumePage() {
  const summaryFn = useServerFn(writeResumeSummary);
  const bulletsFn = useServerFn(improveBullets);
  const scoreFn = useServerFn(scoreResume);

  const [tab, setTab] = useState<string>("summary");
  const [loading, setLoading] = useState(false);

  // summary
  const [role, setRole] = useState(ROLES[0]);
  const [tone, setTone] = useState(TONES[0]);
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [summaries, setSummaries] = useState<string[]>([]);

  // bullets
  const [rawBullets, setRawBullets] = useState("");
  const [bullets, setBullets] = useState<string[]>([]);

  // score
  const [resume, setResume] = useState("");
  const [fileName, setFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [dragging, setDragging] = useState(false);

  const loadFile = async (f: File) => {
    setParsing(true);
    try {
      const text = await extractResumeText(f);
      if (!text) throw new Error("Couldn't read any text from that file.");
      setResume(text);
      setFileName(f.name);
      toast.success("Resume loaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't read that file");
    } finally {
      setParsing(false);
    }
  };
  const [jd, setJd] = useState("");
  const [score, setScore] = useState<{
    score: number;
    verdict: string;
    missingKeywords: string[];
    fixes: string[];
    strengths: string[];
  } | null>(null);

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    try {
      await fn();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <FileText className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">AI Resume Builder</h1>
          <p className="text-sm text-muted-foreground">
            Three tools: write a summary, turn duties into impact bullets, and score your resume like an ATS would.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "summary" && (
        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-border/60 p-6 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Target role</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ROLES.slice(0, 6).map((r) => (
                    <Chip key={r} active={role === r} onClick={() => setRole(r)}>
                      {r}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Tone</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TONES.map((t) => (
                    <Chip key={t} active={tone === t} onClick={() => setTone(t)}>
                      {t}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Key skills</label>
              <Input
                className="mt-2"
                placeholder="React, TypeScript, Node.js, PostgreSQL, AWS"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Experience so far</label>
              <Textarea
                className="mt-2 min-h-28"
                placeholder="Final-year CS student, 2 internships, built a booking app used by 3,000 people..."
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
            </div>
            <Button
              variant="hero"
              disabled={loading || !skills.trim()}
              onClick={() =>
                run(async () => {
                  const r = await summaryFn({ data: { role, skills, experience, tone } });
                  setSummaries(r.summaries);
                })
              }
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate 3 summaries
            </Button>
          </div>

          {summaries.map((s, i) => (
            <div key={i} className="rounded-2xl border border-border/60 p-5">
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm leading-relaxed">{s}</p>
                <Button variant="ghost" size="sm" onClick={() => copy(s)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "bullets" && (
        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-border/60 p-6 space-y-5">
            <div>
              <label className="text-sm font-medium">Target role</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {ROLES.slice(0, 6).map((r) => (
                  <Chip key={r} active={role === r} onClick={() => setRole(r)}>
                    {r}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Your current bullet points or duties</label>
              <Textarea
                className="mt-2 min-h-40"
                placeholder={"Worked on the frontend team\nFixed bugs in the checkout page\nHelped with testing"}
                value={rawBullets}
                onChange={(e) => setRawBullets(e.target.value)}
              />
            </div>
            <Button
              variant="hero"
              disabled={loading || !rawBullets.trim()}
              onClick={() =>
                run(async () => {
                  const r = await bulletsFn({ data: { role, text: rawBullets } });
                  setBullets(r.bullets);
                })
              }
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ListChecks className="h-4 w-4" />}
              Rewrite with impact
            </Button>
          </div>

          {bullets.length > 0 && (
            <div className="rounded-2xl border border-border/60 p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold">Improved bullets</h3>
                <Button variant="ghost" size="sm" onClick={() => copy(bullets.map((b) => `• ${b}`).join("\n"))}>
                  <Copy className="h-4 w-4" /> Copy all
                </Button>
              </div>
              <ul className="mt-4 space-y-3">
                {bullets.map((b, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed">
                    <span className="text-primary">•</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {tab === "score" && (
        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-border/60 p-6 space-y-5">
            <div>
              <label className="text-sm font-medium">Upload your resume</label>
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) void loadFile(f);
                }}
                className={`mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-6 py-10 text-center transition-colors ${
                  dragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/60"
                }`}
              >
                <input
                  type="file"
                  accept={ACCEPTED}
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void loadFile(f);
                    e.target.value = "";
                  }}
                />
                {parsing ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : (
                  <Upload className="h-6 w-6 text-primary" />
                )}
                <p className="text-sm font-medium">
                  {parsing ? "Reading your file..." : fileName || "Drop your resume here or click to browse"}
                </p>
                <p className="text-xs text-muted-foreground">PDF, DOCX, TXT — read in your browser, nothing stored</p>
              </label>
            </div>
            <div>
              <label className="text-sm font-medium">
                Resume text {resume.trim() ? `(${resume.trim().split(/\s+/).length} words)` : "— or paste it here"}
              </label>
              <Textarea
                className="mt-2 min-h-48"
                placeholder="Paste the full text of your resume here..."
                value={resume}
                onChange={(e) => setResume(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Job description (optional)</label>
              <Textarea
                className="mt-2 min-h-32"
                placeholder="Paste the job posting to check keyword match..."
                value={jd}
                onChange={(e) => setJd(e.target.value)}
              />
            </div>
            <Button
              variant="hero"
              disabled={loading || resume.trim().length < 50}
              onClick={() =>
                run(async () => {
                  const r = await scoreFn({ data: { resume, jobDescription: jd || undefined } });
                  setScore(r);
                })
              }
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gauge className="h-4 w-4" />}
              Score my resume
            </Button>
          </div>

          {score && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border/60 p-6 text-center">
                <div className="font-display text-6xl font-bold text-gradient">{score.score}</div>
                <p className="mt-2 text-sm text-muted-foreground">out of 100</p>
                <p className="mt-4 font-medium">{score.verdict}</p>
              </div>

              {score.missingKeywords.length > 0 && (
                <div className="rounded-2xl border border-border/60 p-6">
                  <h3 className="font-display font-semibold">Missing keywords</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {score.missingKeywords.map((k) => (
                      <span key={k} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-border/60 p-6">
                  <h3 className="font-display font-semibold">What works</h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {score.strengths.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-border/60 p-6">
                  <h3 className="font-display font-semibold">Fix these</h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {score.fixes.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}