import { useState, useEffect } from "react";
import { Award, ChevronRight, X, HelpCircle, Plus, Clock, AlertCircle, CheckCircle, Trophy, Play, RotateCcw, Sparkles } from "lucide-react";
import { PRP } from "@/app/lib/constants";
import { Btn, Badge } from "@/app/components/shared";
import { useAuth } from "@/app/context/AuthContext";
import {
  listCourses, listResources, listQuizzesByCourse, generateQuiz, submitQuizAttempt, ApiError,
  type CourseResponse, type LearningResourceResponse, type QuizResponse, type QuizAttemptResponse,
  searchQuizzes,
  QuizQuestionReviewResponse,
  publishQuiz,
  deleteQuestion,
  updateQuestion,
  getQuizForReview,
} from "@/app/lib/api";

// ─── Quiz page ────────────────────────────────────────────────────────────────

export default function QuizPage() {
  const { token, user } = useAuth();
  const isLecturer = user?.role === "LECTURER";

  const [view, setView] = useState<"browse" | "active" | "done" | "review">("browse");

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
    const [questionFormat, setQuestionFormat] = useState("MCQ");
  const [topicSearch, setTopicSearch] = useState("");
  // Taking a quiz
  const [activeQuiz, setActiveQuiz] = useState<QuizResponse | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [submitting, setSubmitting] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [globalTopic, setGlobalTopic] = useState("");
  const [globalFormat, setGlobalFormat] = useState("");
  const [globalResults, setGlobalResults] = useState<QuizResponse[]>([]);
  const [globalLoading, setGlobalLoading] = useState(false);

  // Result
  const [result, setResult] = useState<QuizAttemptResponse | null>(null);

  const [reviewQuiz, setReviewQuiz] = useState<QuizResponse | null>(null);
  const [reviewQuestions, setReviewQuestions] = useState<QuizQuestionReviewResponse[]>([]);
  const [loadingReview, setLoadingReview] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editOptions, setEditOptions] = useState<string[]>([]);
  const [editAnswer, setEditAnswer] = useState("");
  const [publishing, setPublishing] = useState(false);

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
            const quiz = await generateQuiz(genResourceId, numQuestions, difficulty, questionFormat, token);
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

    async function openReview(quiz: QuizResponse) {
    if (!token) return;
    setReviewQuiz(quiz);
    setView("review");
    setLoadingReview(true);
    try {
      const qs = await getQuizForReview(quiz.id, token);
      setReviewQuestions(qs);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load review.");
    } finally {
      setLoadingReview(false);
    }
  }

  function startEdit(q: QuizQuestionReviewResponse) {
    setEditingId(q.id);
    setEditText(q.questionText);
    setEditOptions(q.options.length > 0 ? [...q.options] : ["", "", "", ""]);
    setEditAnswer(q.correctAnswer);
  }

  async function saveEdit() {
    if (!token || !editingId) return;
    try {
      await updateQuestion(editingId, editText, reviewQuiz?.questionFormat === "SHORT_ANSWER" ? [] : editOptions, editAnswer, token);
      setReviewQuestions((prev) => prev.map((q) => q.id === editingId ? { ...q, questionText: editText, options: reviewQuiz?.questionFormat === "SHORT_ANSWER" ? [] : editOptions, correctAnswer: editAnswer } : q));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save.");
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    if (!token) return;
    if (!window.confirm("Delete this question?")) return;
    try {
      await deleteQuestion(questionId, token);
      setReviewQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete.");
    }
  }

  async function handlePublish() {
    if (!token || !reviewQuiz) return;
    setPublishing(true);
    try {
      await publishQuiz(reviewQuiz.id, token);
      setQuizzes((prev) => prev.map((q) => q.id === reviewQuiz.id ? { ...q, published: true } : q));
      setView("browse");
      setReviewQuiz(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not publish.");
    } finally {
      setPublishing(false);
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

  async function runGlobalSearch() {
    if (!token) return;
    setGlobalLoading(true);
    try {
      const results = await searchQuizzes(token, globalTopic, globalFormat);
      setGlobalResults(results);
    } finally {
      setGlobalLoading(false);
    }
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

        <div className="flex items-center justify-between">
          <button
            onClick={() => setSearchMode(!searchMode)}
            className="text-xs font-semibold hover:underline"
            style={{ color: PRP }}
          >
            {searchMode ? "← Back to course browsing" : "Search all quizzes without picking a course →"}
          </button>
        </div>

        {searchMode ? (
          <div className="space-y-3">
            <input
              value={globalTopic}
              onChange={(e) => setGlobalTopic(e.target.value)}
              placeholder="Search any topic — CSS, PHP, HTML…"
              className="w-full bg-[var(--lm-card-bg)] border border-[var(--lm-border)] rounded-xl px-3 py-2.5 text-sm outline-none text-[var(--lm-text)]"
            />
            <div className="flex gap-2">
              {[["", "Any type"], ["MCQ", "MCQ"], ["SHORT_ANSWER", "Short Answer"]].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setGlobalFormat(val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${globalFormat === val ? "text-white" : "bg-[var(--lm-surface)] text-[var(--lm-text-faint)]"}`}
                  style={globalFormat === val ? { backgroundColor: PRP } : {}}
                >
                  {label}
                </button>
              ))}
            </div>
            <Btn variant="gradient" size="sm" onClick={runGlobalSearch} disabled={globalLoading}>
              {globalLoading ? "Searching…" : "Search"}
            </Btn>

            <div className="space-y-2.5 pt-2">
              {globalResults.map((quiz) => (
                <div key={quiz.id} className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-sm font-bold text-[var(--lm-text)]">{quiz.skillLabel ?? quiz.title}</p>
                    <p className="text-xs text-[var(--lm-text-faint)] flex items-center gap-2 flex-wrap">
                      {quiz.courseCode} · {quiz.questions.length} questions
                      {quiz.difficulty && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--lm-surface)]">{quiz.difficulty}</span>}
                    </p>
                  </div>
                  <Btn variant="gradient" size="sm" onClick={() => startQuiz(quiz)}><Play size={13} /> Start</Btn>
                </div>
              ))}
            </div>
          </div>
        ) : (
        <>
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
                        <div className="flex gap-2">
              {["MCQ", "SHORT_ANSWER"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setQuestionFormat(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    questionFormat === f ? "text-white" : "bg-[var(--lm-surface)] text-[var(--lm-text-faint)] hover:text-[var(--lm-text)]"
                  }`}
                  style={questionFormat === f ? { backgroundColor: PRP } : {}}
                >
                  {f === "MCQ" ? "Multiple Choice" : "Short Answer"}
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

                <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-[var(--lm-text-faint)] uppercase tracking-wider mb-1.5">Search by topic</label>
            <input
              value={topicSearch}
              onChange={(e) => setTopicSearch(e.target.value)}
              list="topic-suggestions"
              placeholder="e.g. CSS, PHP, HTML…"
              className="w-full bg-[var(--lm-card-bg)] border border-[var(--lm-border)] rounded-xl px-3 py-2.5 text-sm outline-none text-[var(--lm-text)]"
            />
            <datalist id="topic-suggestions">
              {[...new Set(quizzes.map((q) => q.skillLabel).filter(Boolean))].map((label) => (
                <option key={label} value={label!} />
              ))}
            </datalist>
          </div>

          {loadingQuizzes && <p className="text-sm text-[var(--lm-text-faint)]">Loading quizzes…</p>}
          {!loadingQuizzes && quizzes.length === 0 && (
            <p className="text-sm text-[var(--lm-text-faint)] text-center py-6">No quizzes yet for this course.</p>
          )}
          {!loadingQuizzes && quizzes.length > 0 &&
            quizzes.filter((q) => !topicSearch.trim() || (q.skillLabel ?? "").toLowerCase().includes(topicSearch.trim().toLowerCase())).length === 0 && (
            <p className="text-sm text-[var(--lm-text-faint)] text-center py-6">No topics match "{topicSearch}".</p>
          )}
          {quizzes
            .filter((q) => !topicSearch.trim() || (q.skillLabel ?? "").toLowerCase().includes(topicSearch.trim().toLowerCase()))
            .map((quiz) => (
            <div key={quiz.id} className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-sm font-bold text-[var(--lm-text)]">{quiz.skillLabel ?? quiz.title}</p>
                <p className="text-xs text-[var(--lm-text-faint)] flex items-center gap-2 flex-wrap">
                  {quiz.questions.length} questions
                  {quiz.difficulty && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--lm-surface)] text-[var(--lm-text-muted)]">{quiz.difficulty}</span>
                  )}
                  {quiz.questionFormat && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EEF2FF] text-[#4338CA]">
                      {quiz.questionFormat === "SHORT_ANSWER" ? "Short Answer" : "MCQ"}
                    </span>
                  )}
                </p>
              </div>
                            <div className="flex items-center gap-2">
                {isLecturer && !quiz.published && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-100 text-amber-700">Draft</span>
                )}
                {isLecturer && !quiz.published ? (
                  <Btn variant="gradient" size="sm" onClick={() => openReview(quiz)}>Review & Publish</Btn>
                ) : (
                  <Btn variant="gradient" size="sm" onClick={() => startQuiz(quiz)}><Play size={13} /> Start</Btn>
                )}
              </div>
            </div>
                    ))}
        </div>
        </>
        )}
      </div>
    );
  }

    // ── Review view (lecturer checks questions before publishing) ───────────
  if (view === "review" && reviewQuiz) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        <button onClick={() => { setView("browse"); setReviewQuiz(null); }} className="text-xs text-[var(--lm-text-faint)] hover:text-[var(--lm-text)] flex items-center gap-1">
          <X size={13} /> Cancel review
        </button>

        <div>
          <h2 className="text-lg font-bold text-[var(--lm-text)]">{reviewQuiz.skillLabel ?? reviewQuiz.title}</h2>
          <p className="text-xs text-[var(--lm-text-faint)]">Review each question and its answer before publishing to students.</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}
        {loadingReview && <p className="text-sm text-[var(--lm-text-faint)]">Loading…</p>}

        <div className="space-y-3">
          {reviewQuestions.map((q, idx) => (
            <div key={q.id} className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-4 shadow-sm">
                            {editingId === q.id ? (
                <div className="space-y-2.5">
                  <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={2}
                    className="w-full bg-[var(--lm-surface)] rounded-lg px-3 py-2 text-sm outline-none text-[var(--lm-text)] resize-none" />

                  {reviewQuiz.questionFormat !== "SHORT_ANSWER" ? (
                    <>
                      <p className="text-[10px] font-bold text-[var(--lm-text-faint)] uppercase tracking-wider">Options — click the correct one</p>
                      {editOptions.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            value={opt}
                            onChange={(e) => {
                              const next = [...editOptions];
                              const oldValue = next[i];
                              next[i] = e.target.value;
                              setEditOptions(next);
                              // Keep the correct-answer pointer in sync if the
                              // text of the currently-correct option is edited.
                              if (editAnswer === oldValue) setEditAnswer(e.target.value);
                            }}
                            className={`flex-1 rounded-lg px-3 py-2 text-xs outline-none text-[var(--lm-text)] border ${
                              editAnswer === opt ? "border-[#059669] bg-[#ECFDF5]" : "border-transparent bg-[var(--lm-surface)]"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setEditAnswer(opt)}
                            className={`text-[10px] font-bold px-2 py-1.5 rounded-lg flex-shrink-0 transition-colors ${
                              editAnswer === opt ? "bg-[#059669] text-white" : "bg-[var(--lm-surface)] text-[var(--lm-text-faint)] hover:text-[var(--lm-text)]"
                            }`}
                          >
                            {editAnswer === opt ? "✓ Correct" : "Mark correct"}
                          </button>
                        </div>
                      ))}
                    </>
                  ) : (
                    <input
                      value={editAnswer}
                      onChange={(e) => setEditAnswer(e.target.value)}
                      placeholder="Correct answer"
                      className="w-full bg-[var(--lm-surface)] rounded-lg px-3 py-2 text-xs font-semibold outline-none text-[#059669]"
                    />
                  )}

                  <div className="flex gap-2">
                    <Btn variant="gradient" size="sm" onClick={saveEdit} disabled={reviewQuiz.questionFormat !== "SHORT_ANSWER" && !editOptions.includes(editAnswer)}>Save</Btn>
                    <Btn variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancel</Btn>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold text-[var(--lm-text)] mb-2">{idx + 1}. {q.questionText}</p>
                  {q.options.length > 0 && (
                    <div className="space-y-1 mb-2">
                      {q.options.map((opt, i) => (
                        <p key={i} className={`text-xs px-2 py-1 rounded ${opt === q.correctAnswer ? "bg-[#ECFDF5] text-[#059669] font-semibold" : "text-[var(--lm-text-faint)]"}`}>
                          {opt}
                        </p>
                      ))}
                    </div>
                  )}
                  {q.options.length === 0 && (
                    <p className="text-xs px-2 py-1 rounded bg-[#ECFDF5] text-[#059669] font-semibold mb-2">Answer: {q.correctAnswer}</p>
                  )}
                  <div className="flex gap-2">
                    <Btn variant="outline" size="sm" onClick={() => startEdit(q)}>Edit</Btn>
                    <Btn variant="ghost" size="sm" onClick={() => handleDeleteQuestion(q.id)}>Delete</Btn>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <Btn variant="gradient" className="w-full justify-center" onClick={handlePublish} disabled={publishing || reviewQuestions.length === 0}>
          {publishing ? "Publishing…" : "Publish Quiz to Students"}
        </Btn>
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

          {activeQuiz.questionFormat === "SHORT_ANSWER" ? (
            <input
              value={selected ?? ""}
              onChange={(e) => selectAnswer(e.target.value)}
              placeholder="Type your answer…"
              className="w-full bg-[var(--lm-surface)] border border-[var(--lm-border)] rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-[#7C3AED]/25 text-[var(--lm-text)]"
            />
          ) : (
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
          )}

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