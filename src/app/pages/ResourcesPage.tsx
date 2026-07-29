import { useState, useRef, useEffect } from "react";
import { User, Search, Send, Paperclip, File, Bot } from "lucide-react";
import { PRP } from "@/app/lib/constants";
import { Btn, TypeBadge } from "@/app/components/shared";
import { listCourses, listResources, uploadResource, askAi, ApiError, type CourseResponse, type LearningResourceResponse } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { AiAnswer } from "@/app/components/shared/AiAnswer";

// ─── Resources page ───────────────────────────────────────────────────────────

export default function ResourcesPage() {
  const { token, user } = useAuth();
  const isLecturer = user?.role === "LECTURER";

  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [selCourse, setSelCourse] = useState<string>("");
  const [resources, setResources] = useState<LearningResourceResponse[]>([]);
  const [loadingRes, setLoadingRes] = useState(false);
  const [resError, setResError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selRes, setSelRes] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [msgs, setMsgs] = useState<{ id: number; role: "ai" | "user"; text: string }[]>([
    { id: 1, role: "ai", text: "Hello! I have access to all your course resources. Select a document from the chapter list and I can explain, summarise, or quiz you on it." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load the course list once, and auto-select the first one
  useEffect(() => {
    if (!token) return;
    listCourses(token)
      .then((cs) => {
        setCourses(cs);
        if (cs.length > 0) setSelCourse(cs[0].id);
      })
      .catch(() => setResError("Could not load courses."));
  }, [token]);

  // Whenever the selected course changes, reload its resources
  useEffect(() => {
    if (!token || !selCourse) return;
    setLoadingRes(true);
    setResError(null);
    listResources(selCourse, token)
      .then(setResources)
      .catch((err) => setResError(err instanceof ApiError ? err.message : "Could not load resources."))
      .finally(() => setLoadingRes(false));
  }, [token, selCourse]);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token || !selCourse) return;

    setUploading(true);
    setResError(null);
    try {
      const created = await uploadResource(selCourse, file, token);
      setResources((prev) => [created, ...prev]);
    } catch (err) {
      setResError(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      // Reset so selecting the same file again still fires onChange
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const send = async () => {
    if (!input.trim() || typing || !token) return;
    const q = input.trim();

    if (!selRes) {
      setMsgs((m) => [...m, { id: Date.now(), role: "ai" as const, text: "Please select a document on the left first, so I know which resource to answer from." }]);
      setInput("");
      return;
    }

    setMsgs((m) => [...m, { id: Date.now(), role: "user" as const, text: q }]);
    setInput("");
    setTyping(true);
    try {
      const res = await askAi(q, token, selRes);
      setMsgs((m) => [...m, { id: Date.now() + 1, role: "ai" as const, text: res.answer }]);
    } catch (err) {
      const msg = err instanceof ApiError
        ? "Sorry — I couldn't reach the AI service. Is it running?"
        : "Something went wrong. Please try again.";
      setMsgs((m) => [...m, { id: Date.now() + 1, role: "ai" as const, text: msg }]);
    } finally {
      setTyping(false);
    }
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  return (
    <div className="flex h-full">
      {/* Chapter tree */}
      <div className="w-72 border-r border-[var(--lm-border)] bg-[var(--lm-card-bg)] flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-[var(--lm-border)]">
          <h3 className="text-sm font-bold text-[var(--lm-text)]">Chapter &amp; Resource Type</h3>
          <div className="relative mt-2">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--lm-text-faint)]" />
            <input placeholder="Search resources…" className="w-full bg-[var(--lm-surface)] rounded-lg pl-7 pr-3 py-1.5 text-xs outline-none text-[var(--lm-text)] placeholder:text-[var(--lm-text-faint)]" />
          </div>
        </div>
        <div className="px-4 pb-3">
          <label className="block text-[10px] font-bold text-[var(--lm-text-faint)] uppercase tracking-wider mb-1.5">Course</label>
          <select
            value={selCourse}
            onChange={(e) => { setSelCourse(e.target.value); setSelRes(null); }}
            className="w-full bg-[var(--lm-surface)] rounded-lg px-3 py-2 text-xs outline-none text-[var(--lm-text)]"
          >
            {courses.length === 0 && <option value="">No courses yet</option>}
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {loadingRes && <p className="px-3 py-2 text-xs text-[var(--lm-text-faint)]">Loading…</p>}
          {resError && <p className="px-3 py-2 text-xs text-red-600">{resError}</p>}
          {!loadingRes && !resError && resources.length === 0 && (
            <p className="px-3 py-2 text-xs text-[var(--lm-text-faint)]">No resources uploaded yet.</p>
          )}
          {resources.map((res) => (
            <button key={res.id} onClick={() => setSelRes(res.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${selRes === res.id ? "bg-[var(--lm-surface)] text-[#7C3AED]" : "hover:bg-[var(--lm-surface)] text-[var(--lm-text-muted)]"}`}>
              <File size={12} className="flex-shrink-0" />
              <span className="text-xs truncate font-medium flex-1">{res.title}</span>
              <TypeBadge type={res.fileType} />
            </button>
          ))}
        </div>

        {isLecturer && (
          <div className="p-3 border-t border-[var(--lm-border)]">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelected}
              className="hidden"
            />
            <Btn
              variant="gradient"
              size="sm"
              className="w-full justify-center"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !selCourse}
            >
              <File size={12} /> {uploading ? "Uploading…" : "Upload Resource"}
            </Btn>
          </div>
        )}
      </div>

      {/* AI Interface */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-5 py-3 border-b border-[var(--lm-border)] bg-[var(--lm-card-bg)] flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center">
            <Bot size={13} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--lm-text)]">AI Interface</h3>
            <p className="text-[10px] text-[var(--lm-text-faint)]">{selRes ? `Discussing: ${resources.find((r) => r.id === selRes)?.title}` : "Select a resource to begin"}</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
            <span className="text-[10px] text-[#059669] font-semibold">AI Online</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FAF8FF]">
          {msgs.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === "ai" ? "bg-gradient-to-br from-[#4F46E5] to-[#7C3AED]" : "bg-[#E5E7EB]"}`}>
                {m.role === "ai" ? <Bot size={12} className="text-white" /> : <User size={12} className="text-[var(--lm-text-muted)]" />}
              </div>
              <div className={`max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === "ai" ? "bg-[var(--lm-card-bg)] text-[var(--lm-text)] border border-[var(--lm-border)] rounded-tl-sm" : "text-white rounded-tr-sm"}`}
                style={m.role === "user" ? { backgroundColor: PRP } : {}}>
                {m.role === "ai" ? (
                  <AiAnswer text={m.text} />
                ) : (
                  m.text
                )}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center">
                <Bot size={12} className="text-white" />
              </div>
              <div className="bg-[var(--lm-card-bg)] border border-[var(--lm-border)] rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center shadow-sm">
                {[0, 1, 2].map((i) => <span key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: PRP, animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="p-4 border-t border-[var(--lm-border)] bg-[var(--lm-card-bg)]">
          <div className="flex items-center gap-2 bg-[#FAF8FF] border border-[rgba(109,40,217,0.12)] rounded-xl px-3 py-2">
            <button type="button" aria-label="Attach file" title="Attach file" className="text-[var(--lm-text-faint)] hover:text-[#7C3AED] transition-colors"><Paperclip size={16} /></button>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              placeholder="Ask anything about the selected resource…"
              className="flex-1 bg-transparent text-sm text-[var(--lm-text)] placeholder:text-[var(--lm-text-faint)] outline-none" />
            <button type="button" onClick={send} disabled={!input.trim() || typing} aria-label="Send message" title="Send message" className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-opacity disabled:opacity-40" style={{ backgroundColor: PRP }}>
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}