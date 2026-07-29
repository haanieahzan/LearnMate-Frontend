import { useState, useEffect } from "react";
import { BookOpen, Trophy, Flame, Target, ArrowRight, Bot, HelpCircle } from "lucide-react";
import { PRP, PRPL, IND } from "@/app/lib/constants";
import { useAuth } from "@/app/context/AuthContext";
import { Btn, StatCard } from "@/app/components/shared";
import { getStudentAnalytics, ApiError, type StudentAnalyticsResponse } from "@/app/lib/api";

// ─── Dashboard page ───────────────────────────────────────────────────────────
// Every number here is computed live from real quiz/course data — no
// fabricated study-hours, goals, or chat previews.

export default function DashboardPage({ setPage }: { setPage: (p: string) => void }) {
  const { token, user } = useAuth();
  const [data, setData] = useState<StudentAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getStudentAnalytics(token)
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load your analytics."))
      .finally(() => setLoading(false));
  }, [token]);

  const today = new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  if (loading) {
    return <div className="p-6 text-sm text-[var(--lm-text-faint)]">Loading…</div>;
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-[var(--lm-text)]" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          Welcome back, {user?.fullName?.split(" ")[0] ?? "there"} 👋
        </h2>
        <p className="text-sm text-[var(--lm-text-faint)]">{today}</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Courses" value={String(data.totalCourses)} delta="" icon={BookOpen} color={PRP} bg={PRPL} />
            <StatCard label="Quizzes Taken" value={String(data.quizzesTaken)} delta="" icon={HelpCircle} color={IND} bg="#EEF2FF" />
            <StatCard label="Average Score" value={`${data.averageScore}%`} delta="" icon={Trophy} color="#059669" bg="#ECFDF5" />
            <StatCard label="Study Streak" value={`${data.currentStreak}d`} delta="" icon={Flame} color="#F59E0B" bg="#FFFBEB" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Weak skills nudge */}
            <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                <Target size={16} style={{ color: PRP }} />
                <h3 className="font-bold text-[var(--lm-text)] text-sm">Skill Focus</h3>
              </div>
              {data.weakSkillCount === 0 ? (
                <p className="text-sm text-[var(--lm-text-faint)]">
                  {data.quizzesTaken === 0
                    ? "Take a quiz to see your skill breakdown here."
                    : "No weak areas flagged right now — nice work."}
                </p>
              ) : (
                <p className="text-sm text-[var(--lm-text-muted)]">
                  You have <span className="font-bold" style={{ color: PRP }}>{data.weakSkillCount}</span> skill area{data.weakSkillCount !== 1 ? "s" : ""} below 60% average.
                </p>
              )}
              <Btn variant="outline" size="sm" className="w-full justify-center mt-4" onClick={() => setPage("ai-recommendations")}>
                View Recommendations <ArrowRight size={13} />
              </Btn>
            </div>

            {/* Recent quiz attempts */}
            <div className="lg:col-span-2 bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-[var(--lm-text)] text-sm" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Recent Quiz Attempts</h3>
                <button onClick={() => setPage("quiz")} className="text-xs font-semibold flex items-center gap-1 hover:underline" style={{ color: PRP }}>
                  Quiz Center <ArrowRight size={12} />
                </button>
              </div>
              {data.recentAttempts.length === 0 ? (
                <p className="text-sm text-[var(--lm-text-faint)] py-4 text-center">No quiz attempts yet.</p>
              ) : (
                <div className="space-y-2">
                  {data.recentAttempts.map((a, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--lm-surface)] transition-colors">
                      <div>
                        <p className="text-xs font-semibold text-[var(--lm-text)]">{a.quizTitle}</p>
                        <p className="text-[10px] text-[var(--lm-text-faint)]">{new Date(a.attemptedAt).toLocaleDateString()}</p>
                      </div>
                      <span className="text-sm font-bold" style={{ color: Number(a.score) >= 60 ? "#059669" : "#DC2626" }}>{a.score}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] shadow-sm p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--lm-text)]">Have a question about your course material?</p>
                <p className="text-xs text-[var(--lm-text-faint)]">Ask the AI Tutor, grounded in your real uploaded resources.</p>
              </div>
            </div>
            <Btn variant="gradient" size="sm" onClick={() => setPage("ai-tutor")}>
              Open AI Tutor <ArrowRight size={13} />
            </Btn>
          </div>
        </>
      )}
    </div>
  );
}