import { BookOpen, TrendingUp, Plus, Trophy } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { PRP, IND } from "@/app/lib/constants";
import { weeklyHoursData, quizTrendData, sessionBarData, resourceUsageData, PIE_COLORS, heatmapData } from "@/app/lib/mockData";

// ─── Progress & Analytics page ────────────────────────────────────────────────

export default function ProgressPage() {
  const heatLevels = ["bg-[var(--lm-surface)]", "bg-[#DDD6FE]", "bg-[#C4B5FD]", "bg-[#A78BFA]", "bg-[#7C3AED]"];
  return (
    <div className="p-6 space-y-6">
      {/* Three headline stats — wireframe 7 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[var(--lm-text-faint)] font-medium">Total Sessions</p>
            <TrendingUp size={16} className="text-[#059669]" />
          </div>
          <p className="text-5xl font-extrabold text-[var(--lm-text)] mb-1" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>224</p>
          <p className="text-xs font-semibold text-[#059669] flex items-center gap-1"><TrendingUp size={11} />+18 this week</p>
        </div>
        <div className="rounded-2xl p-6 shadow-sm text-white" style={{ background: `linear-gradient(135deg, ${IND}, ${PRP})` }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-indigo-200 font-medium">Average Score</p>
            <Trophy size={16} className="text-yellow-300" />
          </div>
          <p className="text-5xl font-extrabold mb-1" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>90%</p>
          <p className="text-xs font-semibold text-indigo-200 flex items-center gap-1"><TrendingUp size={11} />+6% this month</p>
        </div>
        <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[var(--lm-text-faint)] font-medium">In Progress</p>
            <BookOpen size={16} className="text-[#F59E0B]" />
          </div>
          <p className="text-5xl font-extrabold text-[var(--lm-text)] mb-1" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>30%</p>
          <p className="text-xs text-[var(--lm-text-faint)]">3 of 10 topics started</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-5 shadow-sm">
          <h3 className="font-bold text-[var(--lm-text)] text-sm mb-1">Study Sessions — Monthly</h3>
          <p className="text-xs text-[var(--lm-text-faint)] mb-4">Total sessions per month this year</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sessionBarData} barSize={24}>
              <CartesianGrid key="cg" strokeDasharray="3 3" stroke="rgba(109,40,217,0.06)" />
              <XAxis key="x" dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis key="y" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip key="tt" contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "rgba(109,40,217,0.15)" }} />
              <Bar key="bar" dataKey="sessions" fill={PRP} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-5 shadow-sm">
          <h3 className="font-bold text-[var(--lm-text)] text-sm mb-1">Quiz Performance Trend</h3>
          <p className="text-xs text-[var(--lm-text-faint)] mb-4">Score improvement over 7 weeks</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={quizTrendData}>
              <defs>
                <linearGradient id="qGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop key="s1" offset="5%" stopColor={PRP} stopOpacity={0.2} />
                  <stop key="s2" offset="95%" stopColor={PRP} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid key="cg" strokeDasharray="3 3" stroke="rgba(109,40,217,0.06)" />
              <XAxis key="x" dataKey="week" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis key="y" domain={[50, 100]} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip key="tt" contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "rgba(109,40,217,0.15)" }} />
              <Area key="area" type="monotone" dataKey="score" stroke={PRP} strokeWidth={2.5} fill="url(#qGrad)" dot={{ fill: PRP, r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-5 shadow-sm">
          <h3 className="font-bold text-[var(--lm-text)] text-sm mb-3">Resource Usage</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie key="pie" data={resourceUsageData} cx="50%" cy="50%" innerRadius={40} outerRadius={62} paddingAngle={3} dataKey="value">
                {resourceUsageData.map((entry, i) => <Cell key={`res-${entry.name}`} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip key="tt" contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend key="lg" iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-5 shadow-sm">
          <h3 className="font-bold text-[var(--lm-text)] text-sm mb-3">Weekly Study Hours</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={weeklyHoursData}>
              <defs>
                <linearGradient id="hGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop key="s1" offset="5%" stopColor={IND} stopOpacity={0.2} />
                  <stop key="s2" offset="95%" stopColor={IND} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid key="cg" strokeDasharray="3 3" stroke="rgba(109,40,217,0.05)" />
              <XAxis key="x" dataKey="day" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis key="y" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip key="tt" contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Area key="area" type="monotone" dataKey="hours" stroke={IND} strokeWidth={2} fill="url(#hGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-5 shadow-sm">
          <h3 className="font-bold text-[var(--lm-text)] text-sm mb-3">Activity Summary</h3>
          <div className="space-y-3">
            {([
              { label: "AI Interactions", value: 87, total: 100, color: PRP },
              { label: "Docs Processed", value: 23, total: 30, color: IND },
              { label: "Quizzes Taken", value: 34, total: 50, color: "#2563EB" },
              { label: "Study Goals Met", value: 18, total: 24, color: "#14B8A6" },
            ] as { label: string; value: number; total: number; color: string }[]).map(({ label, value, total, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--lm-text-faint)]">{label}</span>
                  <span className="font-bold text-[var(--lm-text)]">{value}/{total}</span>
                </div>
                <div className="h-1.5 bg-[var(--lm-surface)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(value / total) * 100}%`, backgroundColor: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-[var(--lm-text)] text-sm">Learning Activity Heatmap</h3>
            <p className="text-xs text-[var(--lm-text-faint)]">Study sessions over the past 12 weeks</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--lm-text-faint)]">
            <span>Less</span>
            {heatLevels.map((c, i) => <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />)}
            <span>More</span>
          </div>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {Array.from({ length: 12 }, (_, w) => (
            <div key={w} className="flex flex-col gap-1">
              {Array.from({ length: 7 }, (_, d) => {
                const cell = heatmapData.find((h) => h.week === w && h.day === d);
                return <div key={d} className={`w-3 h-3 rounded-sm ${heatLevels[cell?.level ?? 0]}`} />;
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

