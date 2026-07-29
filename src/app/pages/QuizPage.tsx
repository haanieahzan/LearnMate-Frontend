import { useState, useEffect } from "react";
import { Award, ChevronRight, X, HelpCircle, Plus, Clock, AlertCircle, CheckCircle, Trophy, Play, RotateCcw, Sparkles } from "lucide-react";
import { PRP } from "@/app/lib/constants";
import { Btn, Badge } from "@/app/components/shared";
import { useAuth } from "@/app/context/AuthContext";
import {
  listCourses, listResources, listQuizzesByCourse, generateQuiz, submitQuizAttempt, ApiError,
  type CourseResponse, type LearningResourceResponse, type QuizResponse, type QuizAttemptResponse,
} from "@/app/lib/api";

// ─── Quiz page ────────────────────────────────────────────────────────────────

export default function QuizPage() {
  const { token, user } = useAuth();
  const isLecturer = user?.role === "LECTURER";

  const [view, setView] = useState<"browse" | "active" | "done">("browse");

  // Course + quiz browsing
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [selCourse, setSelCourse] = useState("");
  const [quizzes, setQuizzes] = useState<QuizResponse[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lecturer: generate a new quiz
  const [resources, setResources] = useState<LearningResourceResponse[]>([]);
  const [genResourceId, setGenResourceId] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("Medium");
  const [generating, setGenerating] = useState(false);
  const [modelChoice, setModelChoice] = useState("default");
  // Taking a quiz
  const [activeQuiz, setActiveQuiz] = useState<QuizResponse | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [submitting, setSubmitting] = useState(false);

  // Result
  const [result, setResult] = useState<QuizAttemptResponse | null>(null);

  // Load courses once
  useEffect(() => {
    if (!token) return;
    listCourses(token)
      .then((cs) => {
        setCourses(cs);
        if (cs.length > 0) setSelCourse(cs[0].id);
      })
      .catch(() => setError("Could not load courses."));
  }, [token]);

  // Load quizzes + (for lecturers) resources whenever the course changes
  useEffect(() => {
    if (!token || !selCourse) return;
    setLoadingQuizzes(true);
    setError(null);
    listQuizzesByCourse(selCourse, token)
      .then(setQuizzes)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load quizzes."))
      .finally(() => setLoadingQuizzes(false));

    if (isLecturer) {
      listResources(selCourse, token).then(setResources).catch(() => {});
    }
  }, [token, selCourse, isLecturer]);

  // Countdown timer while taking a quiz
  useEffect(() => {
    if (view !== "active") return;
    const t = setInterval(() => {
      setTimeLeft((v) => {
        if (v <= 1) {
          finishQuiz();
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  async function handleGenerate() {
    if (!token || !genResourceId) return;
    setGenerating(true);
    setError(null);
    try {
      const provider = modelChoice === "default" ? undefined : modelChoice === "gemini" ? "gemini" : "ollama";
      const ollamaModel = modelChoice !== "default" && modelChoice !== "gemini" ? modelChoice : undefined;
      const quiz = await generateQuiz(genResourceId, numQuestions, difficulty, token, provider, ollamaModel);
      setQuizzes((prev) => [quiz, ...prev]);
    } catch (err) {
      if (err instanceof ApiError && err.code === "AI_QUOTA_EXCEEDED") {
        setError("The AI service has reached its daily quota. An administrator needs to switch the AI provider before new quizzes can be generated.");
      } else {
        setError(err instanceof ApiError ? err.message : "Quiz generation failed. Try again in a moment.");
      }
    } finally {
      setGenerating(false);
    }
  }

  function startQuiz(quiz: QuizResponse) {
    setActiveQuiz(quiz);
    setCurrent(0);
    setAnswers({});
    setTimeLeft(600);
    setResult(null);
    setView("active");
  }

  function selectAnswer(option: string) {
    if (!activeQuiz) return;
    const qId = activeQuiz.questions[current].id;
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  }

  function goNext() {
    if (!activeQuiz) return;
    if (current < activeQuiz.questions.length - 1) {
      setCurrent(current + 1);
    } else {
      finishQuiz();
    }
  }

  async function finishQuiz() {
    if (!activeQuiz || !token || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitQuizAttempt(activeQuiz.id, answers, token);
      setResult(res);
      setView("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not submit your attempt.");
    } finally {
      setSubmitting(false);
    }
  }

  function backToBrowse() {
    setView("browse");
    setActiveQuiz(null);
    setResult(null);
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  // ── Browse view ──────────────────────────────────────────────────────────
  if (view === "browse") {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-5">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--lm-surface)] flex items-center justify-center mx-auto mb-3">
            <HelpCircle size={28} style={{ color: PRP }} />
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--lm-text)] mb-1" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Quiz Center</h2>
          <p className="text-sm text-[var(--lm-text-faint)]">AI-generated questions from your uploaded study materials</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

        <div>
          <label className="block text-[10px] font-bold text-[var(--lm-text-faint)] uppercase tracking-wider mb-1.5">Course</label>
          <select
            value={selCourse}
            onChange={(e) => setSelCourse(e.target.value)}
            className="w-full bg-[var(--lm-card-bg)] border border-[var(--lm-border)] rounded-xl px-3 py-2.5 text-sm outline-none text-[var(--lm-text)]"
          >
            {courses.length === 0 && <option value="">No courses yet</option>}
            {courses.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
          </select>
        </div>

        {isLecturer && (
          <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-5 space-y-3">
            <h3 className="text-sm font-bold text-[var(--lm-text)] flex items-center gap-1.5"><Sparkles size={14} style={{ color: PRP }} /> Generate a new quiz</h3>
            <select
              value={genResourceId}
              onChange={(e) => setGenResourceId(e.target.value)}
              className="w-full bg-[var(--lm-surface)] rounded-lg px-3 py-2 text-xs outline-none text-[var(--lm-text)]"
            >
              <option value="">Select a resource…</option>
              {resources.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
            </select>
            <div className="flex items-center gap-3">
              <label className="text-xs text-[var(--lm-text-faint)]">Questions:</label>
              <input
                type="number" min={3} max={10} value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-16 bg-[var(--lm-surface)] rounded-lg px-2 py-1 text-xs outline-none text-[var(--lm-text)]"
              />
            </div>
            <div className="flex gap-2">
              {["Easy", "Medium", "Hard"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    difficulty === d ? "text-white" : "bg-[var(--lm-surface)] text-[var(--lm-text-faint)] hover:text-[var(--lm-text)]"
                  }`}
                  style={difficulty === d ? { backgroundColor: PRP } : {}}
                >
                  {d}
                </button>
              ))}
            </div>
            <div>
              <label className="text-[10px] font-bold text-[var(--lm-text-faint)] uppercase tracking-wider block mb-1">AI Model</label>
              <select
                value={modelChoice}
                onChange={(e) => setModelChoice(e.target.value)}
                className="bg-[var(--lm-surface)] rounded-lg px-2 py-1.5 text-xs outline-none text-[var(--lm-text)]"
              >
                <option value="default">Use default</option>
                <option value="gemini">Gemini (cloud)</option>
                <option value="llama3.1:latest">Llama 3.1 (local)</option>
                <option value="qwen3:8b">Qwen 3 8B (local)</option>
                <option value="qwen2.5:7b">Qwen 2.5 7B (local)</option>
                <option value="phi3:latest">Phi-3 (local)</option>
              </select>
            </div>
            <Btn variant="gradient" size="sm" onClick={handleGenerate} disabled={generating || !genResourceId}>
              {generating ? "Generating… (can take ~15s)" : <><Plus size={13} /> Generate Quiz</>}
            </Btn>
          </div>
        )}

        <div className="space-y-2.5">
          {loadingQuizzes && <p className="text-sm text-[var(--lm-text-faint)]">Loading quizzes…</p>}
          {!loadingQuizzes && quizzes.length === 0 && (
            <p className="text-sm text-[var(--lm-text-faint)] text-center py-6">No quizzes yet for this course.</p>
          )}
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-sm font-bold text-[var(--lm-text)]">{quiz.title}</p>
                <p className="text-xs text-[var(--lm-text-faint)]">{quiz.questions.length} questions</p>
              </div>
              <Btn variant="gradient" size="sm" onClick={() => startQuiz(quiz)}>
                <Play size={13} /> Start
              </Btn>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Active (taking the quiz) view ────────────────────────────────────────
  if (view === "active" && activeQuiz) {
    const q = activeQuiz.questions[current];
    const selected = answers[q.id];
    const progress = ((current + (selected ? 1 : 0)) / activeQuiz.questions.length) * 100;

    return (
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[var(--lm-text-faint)]">Question {current + 1} / {activeQuiz.questions.length}</span>
          <div className={`flex items-center gap-2 font-mono text-sm font-bold px-3 py-1.5 rounded-xl ${timeLeft < 120 ? "bg-[#FEF2F2] text-[#DC2626]" : "bg-[var(--lm-surface)] text-[var(--lm-text)]"}`}>
            <Clock size={13} /> {mm}:{ss}
          </div>
        </div>
        <div className="h-2 bg-[var(--lm-surface)] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: PRP }} />
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

        <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-6 shadow-sm">
          <p className="text-base font-semibold text-[var(--lm-text)] leading-relaxed mb-5">{q.questionText}</p>
          <div className="space-y-2.5">
            {q.options.map((opt, i) => {
              const isSelected = selected === opt;
              const cls = isSelected
                ? "border-[#7C3AED] bg-[var(--lm-surface)]"
                : "border-[rgba(109,40,217,0.12)] bg-[#FAF8FF] hover:border-[#7C3AED] hover:bg-[var(--lm-surface)]";
              return (
                <button key={i} onClick={() => selectAnswer(opt)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-all flex items-center gap-3 border ${cls}`}>
                  <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-[var(--lm-text-faint)] mt-4">You'll see which answers were correct after submitting the quiz.</p>
        </div>

        <div className="flex justify-between">
          <Btn variant="ghost" onClick={backToBrowse}><X size={13} /> Exit</Btn>
          <Btn variant="gradient" onClick={goNext} disabled={!selected || submitting}>
            {submitting ? "Submitting…" : current < activeQuiz.questions.length - 1 ? "Next Question" : "Finish Quiz"} <ChevronRight size={13} />
          </Btn>
        </div>
      </div>
    );
  }

  // ── Results view ─────────────────────────────────────────────────────────
  if (view === "done" && result) {
    const pct = Number(result.score);
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-5">
        <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-8 text-center shadow-sm">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${pct >= 80 ? "bg-[#ECFDF5]" : pct >= 60 ? "bg-[#FFFBEB]" : "bg-[#FEF2F2]"}`}>
            {pct >= 80 ? <Trophy size={32} className="text-[#059669]" /> : pct >= 60 ? <Award size={32} className="text-[#D97706]" /> : <AlertCircle size={32} className="text-[#DC2626]" />}
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--lm-text)] mb-1" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            {pct >= 80 ? "Excellent Work!" : pct >= 60 ? "Good Effort!" : "Keep Studying!"}
          </h2>
          <p className="text-sm text-[var(--lm-text-faint)] mb-4">You scored {result.correctCount}/{result.totalQuestions} questions</p>
          <p className="text-6xl font-extrabold mb-3" style={{ color: pct >= 80 ? "#059669" : pct >= 60 ? "#D97706" : "#DC2626", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{pct}%</p>
          <div className="h-3 bg-[var(--lm-surface)] rounded-full overflow-hidden mb-6">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct >= 80 ? "#059669" : pct >= 60 ? "#D97706" : "#DC2626" }} />
          </div>
          <div className="space-y-3 text-left mb-5">
            {result.breakdown.map((r) => (
              <div key={r.questionId} className={`rounded-xl p-4 border ${r.correct ? "bg-[#ECFDF5] border-[#A7F3D0]" : "bg-[#FEF2F2] border-[#FECACA]"}`}>
                <div className="flex items-start gap-2 mb-1">
                  {r.correct ? <CheckCircle size={15} className="text-[#059669] mt-0.5 flex-shrink-0" /> : <AlertCircle size={15} className="text-[#DC2626] mt-0.5 flex-shrink-0" />}
                  <p className="text-sm font-semibold text-[var(--lm-text)]">{r.questionText}</p>
                </div>
                <div className="ml-6 text-xs space-y-0.5">
                  <p className="text-[var(--lm-text-muted)]">Your answer: {r.selectedAnswer ?? "(none)"}</p>
                  {!r.correct && <p className="text-[#059669] font-medium">Correct answer: {r.correctAnswer}</p>}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <Btn variant="outline" onClick={backToBrowse}><RotateCcw size={14} /> Back to Quizzes</Btn>
          </div>
        </div>
      </div>
    );
  }

  return null;
}