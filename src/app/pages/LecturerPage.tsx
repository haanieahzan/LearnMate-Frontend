import { useState, useEffect } from "react";
import { AlertCircle, Trophy, Users, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { PRP, PRPL, IND } from "@/app/lib/constants";
import { StatCard, Badge } from "@/app/components/shared";
import { useAuth } from "@/app/context/AuthContext";
import { getLecturerAnalytics, ApiError, type LecturerAnalyticsResponse } from "@/app/lib/api";

// ─── Lecturer Dashboard ───────────────────────────────────────────────────────
// Every number here is a real aggregate over actual quiz attempts — no
// fabricated student roster or engagement chart.

export default function LecturerPage() {
  const { token } = useAuth();
  const [data, setData] = useState<LecturerAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getLecturerAnalytics(token)
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load analytics."))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className="p-6 text-sm text-[var(--lm-text-faint)]">Loading…</div>;
  }

  const totalAtRisk = data?.courses.reduce((sum, c) => sum + c.atRiskStudents.length, 0) ?? 0;
  const overallAverage = data && data.courses.length > 0
    ? (data.courses.reduce((sum, c) => sum + Number(c.classAverage), 0) / data.courses.length).toFixed(1)
    : "—";

  return (
    <div className="p-6 space-y-5">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Your Courses" value={String(data.totalCourses)} delta="" icon={HelpCircle} color={PRP} bg={PRPL} />
            <StatCard label="Total Students" value={String(data.totalStudents)} delta="" icon={Users} color={IND} bg="#EEF2FF" />
            <StatCard label="Avg. Class Score" value={data.courses.length > 0 ? `${overallAverage}%` : "—"} delta="" icon={Trophy} color="#059669" bg="#ECFDF5" />
            <StatCard label="At-Risk Students" value={String(totalAtRisk)} delta="" icon={AlertCircle} color="#EF4444" bg="#FEF2F2" />
          </div>

          <div className="space-y-3">
            {data.courses.length === 0 && (
              <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-8 text-center shadow-sm">
                <p className="text-sm text-[var(--lm-text-faint)]">You haven't created any courses yet.</p>
              </div>
            )}

            {data.courses.map((course) => {
              const isExpanded = expandedCourse === course.courseId;
              return (
                <div key={course.courseId} className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedCourse(isExpanded ? null : course.courseId)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--lm-surface)] transition-colors"
                  >
                    <div>
                      <p className="text-xs font-mono font-bold text-[var(--lm-text-faint)]">{course.courseCode}</p>
                      <h3 className="font-bold text-[var(--lm-text)] text-sm">{course.courseTitle}</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-extrabold" style={{ color: Number(course.classAverage) >= 60 ? "#059669" : "#DC2626" }}>
                          {course.totalAttempts > 0 ? `${course.classAverage}%` : "—"}
                        </p>
                        <p className="text-[10px] text-[var(--lm-text-faint)]">{course.quizCount} quizzes · {course.totalAttempts} attempts</p>
                      </div>
                      {course.atRiskStudents.length > 0 && (
                        <Badge color="red">{course.atRiskStudents.length} at risk</Badge>
                      )}
                      {isExpanded ? <ChevronUp size={16} className="text-[var(--lm-text-faint)]" /> : <ChevronDown size={16} className="text-[var(--lm-text-faint)]" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-[var(--lm-border)] p-5">
                      {course.atRiskStudents.length === 0 ? (
                        <p className="text-sm text-[var(--lm-text-faint)]">
                          {course.totalAttempts === 0 ? "No quiz attempts yet for this course." : "No at-risk students — everyone's averaging above 60%."}
                        </p>
                      ) : (
                        <>
                          <p className="text-xs font-bold text-[var(--lm-text-faint)] uppercase tracking-wider mb-3">At-Risk Students (below 60% average)</p>
                          <div className="space-y-2">
                            {course.atRiskStudents.map((s, i) => (
                              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--lm-surface)] transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold">
                                    {s.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-[var(--lm-text)]">{s.fullName}</p>
                                    <p className="text-[10px] text-[var(--lm-text-faint)]">{s.email}</p>
                                  </div>
                                </div>
                                <span className="text-sm font-bold text-[#DC2626]">{s.averageScore}%</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}