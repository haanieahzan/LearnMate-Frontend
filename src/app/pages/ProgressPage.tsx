import { useState, useEffect, useMemo } from "react";
import { Trophy, HelpCircle, Flame, Target } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, ResponsiveContainer } from "recharts";
import { PRP, IND } from "@/app/lib/constants";
import { useAuth } from "@/app/context/AuthContext";
import {
  getStudentAnalytics, getSkillsHistory, getStreak, ApiError,
  type StudentAnalyticsResponse, type QuizAttemptSummary, type StreakResponse,
} from "@/app/lib/api";

// ─── Progress & Analytics page ────────────────────────────────────────────────
// Every chart here is built from real quiz attempt timestamps/scores — no
// fabricated session counts, study hours, or resource-usage stats.

export default function ProgressPage() {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState<StudentAnalyticsResponse | null>(null);
  const [history, setHistory] = useState<QuizAttemptSummary[]>([]);
  const [streak, setStreak] = useState<StreakResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([getStudentAnalytics(token), getSkillsHistory(token), getStreak(token)])
      .then(([a, h, s]) => { setAnalytics(a); setHistory(h); setStreak(s); })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load progress data."))
      .finally(() => setLoading(false));
  }, [token]);

  // Chronological (oldest first) for a proper left-to-right trend line
  const trendData = useMemo(() => {
    return [...history]
      .sort((a, b) => new Date(a.attemptedAt).getTime() - new Date(b.attemptedAt).getTime())
      .map((h, i) => ({ label: `#${i + 1}`, score: Number(h.score), date: new Date(h.attemptedAt).toLocaleDateString() }));
  }, [history]);

  // Real activity heatmap: count attempts per day over the last 12 weeks (84 days)
  const heatmapCells = useMemo(() => {
    const counts: Record<string, number> = {};
    history.forEach((h) => {
      const day = new Date(h.attemptedAt).toDateString();
      counts[day] = (counts[day] ?? 0) + 1;
    });

    const days: { date: Date; count: number }[] = [];
    const today = new Date();
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push({ date: d, count: counts[d.toDateString()] ?? 0 });
    }

    // Group into 12 columns of 7 days each
    const weeks: { date: Date; count: number }[][] = [];
    for (let w = 0; w < 12; w++) {
      weeks.push(days.slice(w * 7, w * 7 + 7));
    }
    return weeks;
  }, [history]);

  const heatLevels = ["bg-[var(--lm-surface)]", "bg-[#DDD6FE]", "bg-[#C4B5FD]", "bg-[#A78BFA]", "bg-[#7C3AED]"];
  function levelFor(count: number) {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count <= 4) return 3;
    return 4;
  }

  if (loading) {
    return <div className="p-6 text-sm text-[var(--lm-text-faint)]">Loading…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

      {analytics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[var(--lm-text-faint)] font-medium">Quiz Attempts</p>
                <HelpCircle size={16} className="text-[#2563EB]" />
              </div>
              <p className="text-5xl font-extrabold text-[var(--lm-text)]" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{analytics.quizzesTaken}</p>
            </div>
            <div className="rounded-2xl p-6 shadow-sm text-white" style={{ background: `linear-gradient(135deg, ${IND}, ${PRP})` }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-indigo-200 font-medium">Average Score</p>
                <Trophy size={16} className="text-yellow-300" />
              </div>
              <p className="text-5xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{analytics.averageScore}%</p>
            </div>
            <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[var(--lm-text-faint)] font-medium">Current Streak</p>
                <Flame size={16} className="text-[#F59E0B]" />
              </div>
              <p className="text-5xl font-extrabold text-[var(--lm-text)]" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{streak?.currentStreak ?? 0}d</p>
              {streak && streak.longestStreak > streak.currentStreak && (
                <p className="text-xs text-[var(--lm-text-faint)] mt-1">Best: {streak.longestStreak} days</p>
              )}
            </div>
          </div>

          <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-5 shadow-sm">
            <h3 className="font-bold text-[var(--lm-text)] text-sm mb-1">Quiz Performance Trend</h3>
            <p className="text-xs text-[var(--lm-text-faint)] mb-4">Score across your quiz attempts, in order taken</p>
            {trendData.length === 0 ? (
              <p className="text-sm text-[var(--lm-text-faint)] py-8 text-center">Take a quiz to start building your trend.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="qGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop key="s1" offset="5%" stopColor={PRP} stopOpacity={0.2} />
                      <stop key="s2" offset="95%" stopColor={PRP} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid key="cg" strokeDasharray="3 3" stroke="rgba(109,40,217,0.06)" />
                  <XAxis key="x" dataKey="label" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis key="y" domain={[0, 100]} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    key="tt"
                    contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "rgba(109,40,217,0.15)" }}
                    labelFormatter={(label) => {
                      const point = trendData.find((d) => d.label === label);
                      return point ? point.date : label;
                    }}
                  />
                  <Area key="area" type="monotone" dataKey="score" stroke={PRP} strokeWidth={2.5} fill="url(#qGrad)" dot={{ fill: PRP, r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-[var(--lm-text)] text-sm">Learning Activity Heatmap</h3>
                <p className="text-xs text-[var(--lm-text-faint)]">Quiz attempts over the past 12 weeks</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--lm-text-faint)]">
                <span>Less</span>
                {heatLevels.map((c, i) => <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />)}
                <span>More</span>
              </div>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1">
              {heatmapCells.map((week, w) => (
                <div key={w} className="flex flex-col gap-1">
                  {week.map((cell, d) => (
                    <div
                      key={d}
                      title={`${cell.date.toLocaleDateString()}: ${cell.count} attempt${cell.count !== 1 ? "s" : ""}`}
                      className={`w-3 h-3 rounded-sm ${heatLevels[levelFor(cell.count)]}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} style={{ color: PRP }} />
              <h3 className="font-bold text-[var(--lm-text)] text-sm">At a Glance</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-extrabold text-[var(--lm-text)]">{analytics.totalCourses}</p>
                <p className="text-[10px] text-[var(--lm-text-faint)] mt-0.5">Courses</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-extrabold" style={{ color: analytics.weakSkillCount > 0 ? "#DC2626" : "#059669" }}>{analytics.weakSkillCount}</p>
                <p className="text-[10px] text-[var(--lm-text-faint)] mt-0.5">Weak Skills</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-extrabold text-[var(--lm-text)]">{streak?.longestStreak ?? 0}d</p>
                <p className="text-[10px] text-[var(--lm-text-faint)] mt-0.5">Longest Streak</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}