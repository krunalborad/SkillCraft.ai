import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "Explain recursion like I'm 12",
  "What's the difference between BFS and DFS?",
  "Why does my React useEffect run twice?",
  "How do I prepare for a system design interview?",
];

export function TutorChat() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hey 👋 I'm SkillCraft, your AI tutor. Ask me anything about CS, web dev, ML, system design — or pick a starter below." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    let acc = "";
    const upsert = (chunk: string) => {
      acc += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > next.length) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: acc } : m));
        }
        return [...prev, { role: "assistant", content: acc }];
      });
    };

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next }),
      });

      if (!resp.ok) {
        if (resp.status === 429) toast.error("Slow down a bit — rate limit hit. Try again in a moment.");
        else if (resp.status === 402) toast.error("AI credits exhausted. Add funds in your workspace.");
        else toast.error("Couldn't reach the AI tutor.");
        setLoading(false);
        return;
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong with the AI tutor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col rounded-3xl bg-gradient-card border border-border/60 overflow-hidden shadow-elegant" style={{ height: "min(78vh, 720px)" }}>
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border/60 glass">
        <div className="relative">
          <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-card" />
        </div>
        <div>
          <div className="font-display font-semibold">SkillCraft Tutor</div>
          <div className="text-xs text-muted-foreground">Online · adaptive AI · ready to help</div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${m.role === "user" ? "bg-secondary" : "bg-gradient-primary shadow-glow"}`}>
              {m.role === "user" ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-primary-foreground" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-gradient-primary text-primary-foreground" : "glass border-border/60"}`}>
              {m.content || (loading && i === messages.length - 1 ? <Loader2 className="h-4 w-4 animate-spin" /> : "")}
            </div>
          </div>
        ))}
      </div>

      {messages.length <= 1 && (
        <div className="px-6 pb-3 flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <button key={s} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full border border-border/60 hover:border-primary/60 hover:text-primary transition-colors text-muted-foreground">
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="border-t border-border/60 p-4 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything — concepts, code, careers..."
          disabled={loading}
          className="flex-1 bg-input border border-border/60 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
        />
        <Button type="submit" variant="hero" disabled={loading || !input.trim()} className="h-auto px-5">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}