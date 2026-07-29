import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Bot, Sparkles, BookOpen, Lightbulb, HelpCircle, AlertTriangle, Settings2 } from "lucide-react";
import { PRP } from "@/app/lib/constants";
import { Btn } from "@/app/components/shared";
import { askAi, ApiError } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { AiAnswer } from "@/app/components/shared/AiAnswer";


const SUGGESTIONS = [
  { icon: BookOpen, text: "Summarise the key concepts" },
  { icon: Lightbulb, text: "Explain this with an example" },
  { icon: HelpCircle, text: "Quiz me on this topic" },
];

export default function AITutorPage() {
  const { token } = useAuth();
  const [msgs, setMsgs] = useState<{ id: number; role: "ai" | "user"; text: string; variant?: "quota" }[]>([
    { id: 1, role: "ai", text: "Hi! I'm your AI study assistant. Ask me anything about your course materials." },
  ]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [modelChoice, setModelChoice] = useState("default");
  const bottomRef = useRef<HTMLDivElement>(null);
  

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  const send = async (text?: string) => {
    const q = (text ?? draft).trim();
    if (!q || loading || !token) return;

    setMsgs((m) => [...m, { id: Date.now(), role: "user", text: q }]);
    setDraft("");
    setLoading(true);
    try {
      const provider = modelChoice === "default" ? undefined : modelChoice === "gemini" ? "gemini" : "ollama";
      const ollamaModel = modelChoice !== "default" && modelChoice !== "gemini" ? modelChoice : undefined;
      const res = await askAi(q, token, undefined, provider, ollamaModel);
      setMsgs((m) => [...m, { id: Date.now() + 1, role: "ai", text: res.answer }]);
    } catch (err) {
      if (err instanceof ApiError && err.code === "AI_QUOTA_EXCEEDED") {
        setMsgs((m) => [...m, {
          id: Date.now() + 1,
          role: "ai",
          variant: "quota",
          text: "The AI service has reached its daily limit and can't answer right now. Please let your lecturer or administrator know, then try again shortly.",
        }]);
      } else {
        const msg = err instanceof ApiError
          ? "Sorry — I couldn't reach the AI service. Is it running?"
          : "Something went wrong. Please try again.";
        setMsgs((m) => [...m, { id: Date.now() + 1, role: "ai", text: msg }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--lm-border)] bg-[var(--lm-card-bg)] flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center">
          <Bot size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-[var(--lm-text)] text-sm" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>AI Study Assistant</h2>
          <p className="text-[10px] text-[#059669] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> Online
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Settings2 size={13} className="text-[var(--lm-text-faint)]" />
          <select
            value={modelChoice}
            onChange={(e) => setModelChoice(e.target.value)}
            className="bg-[var(--lm-surface)] rounded-lg px-2 py-1.5 text-[11px] outline-none text-[var(--lm-text)]"
          >
            <option value="default">Use default</option>
            <option value="gemini">Gemini (cloud)</option>
            <option value="llama3.1:latest">Llama 3.1 (local)</option>
            <option value="qwen3:8b">Qwen 3 8B (local)</option>
            <option value="qwen2.5:7b">Qwen 2.5 7B (local)</option>
            <option value="phi3:latest">Phi-3 (local)</option>
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {msgs.map((m) => (
          m.variant === "quota" ? (
            <div key={m.id} className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={14} className="text-amber-600" />
              </div>
              <div className="max-w-[75%] bg-amber-50 border border-amber-200 rounded-2xl rounded-tl-sm px-4 py-2.5">
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-1">AI temporarily unavailable</p>
                <p className="text-sm text-amber-900">{m.text}</p>
              </div>
            </div>
          ) : (
          <div key={m.id} className={`flex items-start gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === "ai" ? "bg-gradient-to-br from-[#4F46E5] to-[#7C3AED]" : "bg-[var(--lm-surface-mid)]"}`}>
              {m.role === "ai" ? <Bot size={14} className="text-white" /> : <span className="text-[10px] font-bold text-[#7C3AED]">You</span>}
            </div>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "ai" ? "bg-[var(--lm-surface)] text-[var(--lm-text)] rounded-tl-sm" : "bg-[#7C3AED] text-white rounded-tr-sm"}`}>
              <AiAnswer text={m.text} />
            </div>
          </div>
          )
        ))}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-[var(--lm-surface)] rounded-2xl rounded-tl-sm px-4 py-2.5">
              <span className="text-sm text-[var(--lm-text-faint)]">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestion chips (only before the first question) */}
      {msgs.length === 1 && (
        <div className="px-6 pb-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.text}
              onClick={() => send(s.text)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-[var(--lm-border)] text-[var(--lm-text-muted)] hover:bg-[var(--lm-surface)] transition-colors"
            >
              <s.icon size={12} /> {s.text}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-[var(--lm-border)] bg-[var(--lm-card-bg)]">
        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-xl hover:bg-[var(--lm-surface)] text-[var(--lm-text-muted)] transition-colors">
            <Paperclip size={16} />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            placeholder="Ask about your course materials…"
            disabled={loading}
            className="flex-1 bg-[var(--lm-surface)] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#7C3AED]/25 text-[var(--lm-text)] placeholder:text-[var(--lm-text-faint)]"
          />
          <Btn variant="gradient" onClick={() => send()} disabled={loading}>
            <Send size={15} />
          </Btn>
        </div>
      </div>
    </div>
  );
}