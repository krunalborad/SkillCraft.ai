import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Loader2,
  Mic,
  MicOff,
  Volume2,
  Square,
  ArrowRight,
  RefreshCw,
  Lightbulb,
  Trophy,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  generateInterviewQuestions,
  evaluateInterview,
  type InterviewQuestion,
  type InterviewFeedback,
} from "@/lib/career.functions";

export const Route = createFileRoute("/mock-interview")({
  head: () => ({
    meta: [
      { title: "AI Mock Interview — SkillCraft" },
      {
        name: "description",
        content: "Practise technical, behavioural, HR and system design interviews with an AI interviewer that scores every answer.",
      },
      { property: "og:title", content: "AI Mock Interview — SkillCraft" },
      { property: "og:description", content: "Realistic interview rounds with instant scoring and model answers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MockInterviewPage,
});

const ROUNDS = [
  { id: "technical", label: "Technical", desc: "Core CS, coding, and role fundamentals" },
  { id: "behavioural", label: "Behavioural", desc: "STAR stories, teamwork, conflict" },
  { id: "system design", label: "System Design", desc: "Architecture, scale, trade-offs" },
  { id: "hr screening", label: "HR Screening", desc: "Motivation, salary, culture fit" },
  { id: "resume deep-dive", label: "Resume Deep-Dive", desc: "Projects and past work grilling" },
] as const;

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

const LEVELS = ["fresher", "intermediate", "senior"] as const;

// The browser's built-in speech APIs — free, no key, no server round trip.
// Chrome/Edge expose SpeechRecognition under a webkit-prefixed name.
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

function speakBrowser(text: string, onStart: () => void, onEnd: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    toast.error("Voice isn't supported in this browser — try Chrome or Edge.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.onstart = onStart;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.speak(utterance);
}

function stopSpeakingBrowser() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

function MockInterviewPage() {
  const genFn = useServerFn(generateInterviewQuestions);
  const evalFn = useServerFn(evaluateInterview);

  const [role, setRole] = useState(ROLES[0]);
  const [company, setCompany] = useState("");
  const [round, setRound] = useState<string>(ROUNDS[0].id);
  const [difficulty, setDifficulty] = useState<string>("intermediate");
  const [count, setCount] = useState(5);
  const [voiceMode, setVoiceMode] = useState(true);

  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);

  const [speaking, setSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const ask = (text: string) => {
    speakBrowser(
      text,
      () => setSpeaking(true),
      () => setSpeaking(false)
    );
  };

  // Read each question aloud when it appears in voice mode.
  useEffect(() => {
    if (!voiceMode || feedback || questions.length === 0) return;
    const q = questions[current]?.question;
    if (q) ask(q);
    return () => stopSpeakingBrowser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, questions, voiceMode, feedback]);

  useEffect(() => () => stopSpeakingBrowser(), []);

  const toggleRecording = () => {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }

    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) {
      toast.error("Voice input isn't supported in this browser — try Chrome or Edge.");
      return;
    }

    stopSpeakingBrowser();
    setSpeaking(false);

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const text = event.results?.[0]?.[0]?.transcript?.trim();
      if (!text) {
        toast.error("Didn't catch that — try speaking again.");
        return;
      }
      setAnswers((prev) => {
        const next = [...prev];
        next[current] = [next[current]?.trim(), text].filter(Boolean).join(" ");
        return next;
      });
    };

    recognition.onerror = () => {
      toast.error("Microphone access is needed to answer by voice.");
      setRecording(false);
    };

    recognition.onend = () => {
      setRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  };

  const start = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await genFn({ data: { role, round, difficulty, count, company } });
      setQuestions(res.questions);
      setAnswers(new Array(res.questions.length).fill(""));
      setCurrent(0);
      setShowHint(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start the interview");
    } finally {
      setLoading(false);
    }
  };

  const finish = async () => {
    stopSpeakingBrowser();
    setScoring(true);
    try {
      const res = await evalFn({
        data: { role, round, answers: questions.map((q, i) => ({ question: q.question, answer: answers[i] ?? "" })) },
      });
      setFeedback(res);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not score the interview");
    } finally {
      setScoring(false);
    }
  };

  const reset = () => {
    stopSpeakingBrowser();
    setQuestions([]);
    setAnswers([]);
    setFeedback(null);
    setCurrent(0);
  };

  return (
    <div className="relative">
      <div className="absolute -top-40 left-0 h-[36rem] w-[36rem] rounded-full bg-gradient-to-br from-primary/40 to-accent/40 blur-[120px] opacity-30 pointer-events-none" />
      <section className="relative mx-auto max-w-4xl px-6 py-16">
        <span className="text-xs font-mono uppercase tracking-widest text-primary">— Mock Interview —</span>
        <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold tracking-tighter">
          Rehearse the round that <span className="text-gradient">actually decides it</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Pick a role and a round. SkillCraft plays the interviewer, then scores every answer with a model response you can learn from.
        </p>

        {/* Setup */}
        {questions.length === 0 && !feedback && (
          <div className="mt-10 rounded-2xl bg-gradient-card border border-border/60 p-6 shadow-elegant space-y-6">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">Interview round</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {ROUNDS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRound(r.id)}
                    className={`text-left rounded-xl border p-4 transition-colors ${
                      round === r.id ? "border-primary bg-primary/10" : "border-border/60 hover:border-primary/40"
                    }`}
                  >
                    <span className="font-medium">{r.label}</span>
                    <span className="block text-xs text-muted-foreground mt-1">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">Role</p>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">Target company (optional)</p>
                <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Google, Zoho, a startup" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">Experience level</p>
                <div className="flex gap-2">
                  {LEVELS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setDifficulty(l)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm capitalize transition-colors ${
                        difficulty === l ? "border-primary bg-primary/10" : "border-border/60 hover:border-primary/40"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">Questions</p>
                <div className="flex gap-2">
                  {[3, 5, 8].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCount(c)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                        count === c ? "border-primary bg-primary/10" : "border-border/60 hover:border-primary/40"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setVoiceMode(!voiceMode)}
              className={`w-full text-left rounded-xl border p-4 transition-colors ${
                voiceMode ? "border-primary bg-primary/10" : "border-border/60 hover:border-primary/40"
              }`}
            >
              <span className="flex items-center gap-2 font-medium">
                {voiceMode ? <Volume2 className="h-4 w-4 text-primary" /> : <MicOff className="h-4 w-4" />}
                Voice interview {voiceMode ? "on" : "off"}
              </span>
              <span className="block text-xs text-muted-foreground mt-1">
                The interviewer reads each question aloud and you answer by speaking — your voice is written out as text and scored.
              </span>
            </button>

            <Button variant="hero" size="lg" onClick={start} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
              {loading ? "Preparing your interviewer…" : "Start interview"}
            </Button>
          </div>
        )}

        {/* Interview */}
        {questions.length > 0 && !feedback && (
          <div className="mt-10 rounded-2xl bg-gradient-card border border-border/60 p-6 shadow-elegant">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-mono uppercase tracking-wider">
                Question {current + 1} of {questions.length}
              </span>
              <span className="capitalize">{round} · {role}</span>
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-primary transition-all"
                style={{ width: `${((current + 1) / questions.length) * 100}%` }}
              />
            </div>

            <h2 className="mt-6 font-display text-xl md:text-2xl font-semibold leading-snug">{questions[current].question}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p className="text-xs text-primary font-mono uppercase tracking-wider">{questions[current].focus}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (speaking ? (stopSpeakingBrowser(), setSpeaking(false)) : ask(questions[current].question))}
              >
                {speaking ? <Square className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                {speaking ? "Stop" : "Hear question"}
              </Button>
            </div>

            <div className="mt-5 rounded-xl border border-border/60 bg-background/40 p-4 flex flex-wrap items-center gap-4">
              <button
                onClick={toggleRecording}
                aria-label={recording ? "Stop recording" : "Start recording"}
                className={`relative flex h-14 w-14 items-center justify-center rounded-full border transition-colors ${
                  recording ? "border-primary bg-primary/20" : "border-border/60 hover:border-primary/50"
                }`}
              >
                {recording && <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />}
                {recording ? <Square className="h-5 w-5 text-primary" /> : <Mic className="h-5 w-5" />}
              </button>
              <div className="text-sm">
                <p className="font-medium">{recording ? "Listening… speak your answer" : "Answer with your voice"}</p>
                <p className="text-xs text-muted-foreground">
                  {recording ? "Tap the square when you're done." : "Tap the mic, speak naturally, and it becomes text below."}
                </p>
              </div>
            </div>

            <Textarea
              value={answers[current] ?? ""}
              onChange={(e) => {
                const next = [...answers];
                next[current] = e.target.value;
                setAnswers(next);
              }}
              placeholder="Your spoken answer appears here — you can edit or type instead…"
              className="mt-4 min-h-40"
            />

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setShowHint(!showHint)}>
                <Lightbulb className="h-4 w-4" /> {showHint ? "Hide hint" : "Show hint"}
              </Button>
              <span className="text-xs text-muted-foreground">{(answers[current] ?? "").split(/\s+/).filter(Boolean).length} words</span>
            </div>
            {showHint && (
              <p className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm text-muted-foreground">
                {questions[current].hint}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant="ghost"
                disabled={current === 0}
                onClick={() => {
                  setCurrent(current - 1);
                  setShowHint(false);
                }}
              >
                Previous
              </Button>
              {current < questions.length - 1 ? (
                <Button
                  variant="hero"
                  onClick={() => {
                    setCurrent(current + 1);
                    setShowHint(false);
                  }}
                >
                  Next question <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="hero" onClick={finish} disabled={scoring}>
                  {scoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />}
                  {scoring ? "Scoring…" : "Finish & get feedback"}
                </Button>
              )}
              <Button variant="ghost" onClick={reset}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className="mt-10 space-y-6">
            <div className="rounded-2xl bg-gradient-card border border-border/60 p-6 shadow-elegant text-center">
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Overall score</p>
              <p className="mt-2 font-display text-6xl font-bold text-gradient">{feedback.overallScore}</p>
              <p className="mt-2 font-medium">{feedback.verdict}</p>
              <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">{feedback.summary}</p>
              <Button variant="hero" className="mt-6" onClick={reset}>
                <RefreshCw className="h-4 w-4" /> Run another interview
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-border/60 p-6">
                <h3 className="font-display font-semibold mb-3">What worked</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-border/60 p-6">
                <h3 className="font-display font-semibold mb-3">Work on this</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {feedback.improvements.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <Lightbulb className="h-4 w-4 text-accent shrink-0 mt-0.5" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              {feedback.perQuestion.map((q, i) => (
                <div key={i} className="rounded-2xl border border-border/60 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-medium">{q.question}</p>
                    <span className="shrink-0 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-mono">
                      {q.score}/10
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{q.feedback}</p>
                  <p className="mt-3 text-xs font-mono uppercase tracking-wider text-primary">Model answer</p>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{q.modelAnswer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}