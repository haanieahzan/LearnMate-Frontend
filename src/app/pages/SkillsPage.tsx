import { useState, useEffect } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { PRP, IND } from "@/app/lib/constants";
import { useAuth } from "@/app/context/AuthContext";
import { getCurrentSkills, getSkillsHistory, getStreak, ApiError, type FieldScore, type QuizAttemptSummary, type StreakResponse } from "@/app/lib/api";
import { ChevronLeft, Flame } from "lucide-react";

// ─── Skills page ──────────────────────────────────────────────────────────────
// Two-level structure: Field (Programming, AI, etc., set by the lecturer at
// course creation) -> Skill area (the resource each quiz was generated from).
// Both levels are computed live from real quiz performance — no self-report.

function levelFor(pct: number) {
  if (pct >= 90) return { label: "Expert", color: PRP };
  if (pct >= 75) return { label: "Advanced", color: IND };
  if (pct >= 60) return { label: "Proficient", color: "#14B8A6" };
  if (pct >= 40) return { label: "Developing", color: "#F59E0B" };
  return { label: "Beginner", color: "#EF4444" };
}

export default function SkillsPage() {
  const { token } = useAuth();
  const [fields, setFields] = useState<FieldScore[]>([]);
  const [history, setHistory] = useState<QuizAttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [streak, setStreak] = useState<StreakResponse | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([getCurrentSkills(token), getSkillsHistory(token), getStreak(token)])
      .then(([f, h, s]) => { setFields(f); setHistory(h); setStreak(s); })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load skills data."))
      .finally(() => setLoading(false));
  }, [token]);

  const radarData = fields.map((f) => ({
    skill: f.fieldName.length > 28 ? f.fieldName.slice(0, 28) + "…" : f.fieldName,
    value: Number(f.averageScore),
    fullMark: 100,
  }));

  const activeField = fields.find((f) => f.fieldName === selectedField) ?? null;

  if (loading) {
    return <div className="p-6 text-sm text-[var(--lm-text-faint)]">Loading…</div>;
  }

  return (
    <div className="p-6 space-y-5">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--lm-text)]" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Skills Assessment</h2>
          <p className="text-sm text-[var(--lm-text-faint)] mt-0.5">
            Computed automatically from your quiz performance — no self-rating needed.
          </p>
        </div>
        {streak && streak.currentStreak > 0 && (
          <div className="flex items-center gap-2 bg-[#FFF7ED] border border-[#FDE68A] rounded-2xl px-4 py-2.5">
            <Flame size={20} className="text-orange-500" />
            <div>
              <p className="text-sm font-extrabold text-[var(--lm-text)] leading-tight">{streak.currentStreak} day{streak.currentStreak !== 1 ? "s" : ""}</p>
              <p className="text-[10px] text-[var(--lm-text-faint)]">
                {streak.longestStreak > streak.currentStreak ? `Best: ${streak.longestStreak} days` : "Personal best!"}
              </p>
            </div>
          </div>
        )}
      </div>

      {fields.length === 0 && !error && (
        <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-8 text-center shadow-sm">
          <p className="text-sm text-[var(--lm-text-faint)]">
            No quiz attempts yet — take a quiz from the Quiz Center to see your skill breakdown here.
          </p>
        </div>
      )}

      {fields.length > 0 && !activeField && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-5 shadow-sm">
            <h3 className="font-bold text-[var(--lm-text)] mb-3">Fields Radar</h3>
            <ResponsiveContainer width="100%" height={270}>
              <RadarChart data={radarData}>
                <PolarGrid key="pg" stroke="rgba(109,40,217,0.1)" />
                <PolarAngleAxis key="pa" dataKey="skill" tick={{ fontSize: 10, fill: "#6B7280" }} />
                <PolarRadiusAxis key="pr" domain={[0, 100]} tick={{ fontSize: 9, fill: "#9CA3AF" }} />
                <Radar key="rd" dataKey="value" stroke={PRP} fill={PRP} fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-5 shadow-sm">
            <h3 className="font-bold text-[var(--lm-text)] mb-3">Fields</h3>
            <p className="text-xs text-[var(--lm-text-faint)] mb-3">Click a field to see its skill breakdown.</p>
            <div className="space-y-3">
              {fields.map((f) => {
                const pct = Number(f.averageScore);
                const level = levelFor(pct);
                return (
                  <button
                    key={f.fieldName}
                    onClick={() => setSelectedField(f.fieldName)}
                    className="w-full text-left hover:bg-[var(--lm-surface)] rounded-xl p-2 -m-2 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[var(--lm-text)]">{f.fieldName}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: level.color + "20", color: level.color }}>
                        {level.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[var(--lm-surface)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: level.color }} />
                      </div>
                      <span className="text-xs font-bold w-10 text-right" style={{ color: level.color }}>{pct}%</span>
                    </div>
                    <p className="text-[10px] text-[var(--lm-text-faint)] mt-0.5">{f.skills.length} skill area{f.skills.length !== 1 ? "s" : ""}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeField && (
        <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-5 shadow-sm">
          <button
            onClick={() => setSelectedField(null)}
            className="flex items-center gap-1 text-xs text-[var(--lm-text-faint)] hover:text-[var(--lm-text)] mb-4"
          >
            <ChevronLeft size={13} /> Back to fields
          </button>
          <h3 className="font-bold text-[var(--lm-text)] mb-3">{activeField.fieldName} — Skill Breakdown</h3>
          <div className="space-y-3">
            {activeField.skills.map((s) => {
              const pct = Number(s.averageScore);
              const level = levelFor(pct);
              return (
                <div key={s.skillArea}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-[var(--lm-text)] truncate">{s.skillArea}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: level.color + "20", color: level.color }}>
                      {level.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-[var(--lm-surface)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: level.color }} />
                    </div>
                    <span className="text-xs font-bold w-10 text-right" style={{ color: level.color }}>{pct}%</span>
                  </div>
                  <p className="text-[10px] text-[var(--lm-text-faint)] mt-0.5">{s.courseCode} · {s.attemptCount} attempt{s.attemptCount !== 1 ? "s" : ""}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-5 shadow-sm">
          <h3 className="font-bold text-[var(--lm-text)] mb-3">Attempt History</h3>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-xs border-b border-[var(--lm-border)] pb-2 last:border-0">
                <div>
                  <p className="font-medium text-[var(--lm-text)]">{h.quizTitle}</p>
                  <p className="text-[var(--lm-text-faint)]">{new Date(h.attemptedAt).toLocaleDateString()}</p>
                </div>
                <span className="font-bold" style={{ color: levelFor(Number(h.score)).color }}>{h.score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}