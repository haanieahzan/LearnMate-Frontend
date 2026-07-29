import { useState } from "react";
import { BookOpen, Check, Plus, Clock, Calendar, RefreshCw } from "lucide-react";
import { PRP, IND } from "@/app/lib/constants";
import { studyPlanData } from "@/app/lib/mockData";
import { Btn, Badge } from "@/app/components/shared";

// ─── Study Plan page ──────────────────────────────────────────────────────────

export default function StudyPlanPage() {
  const [tasks, setTasks] = useState(studyPlanData);
  const toggle = (id: number) => setTasks((t) => t.map((task) => task.id === id ? { ...task, done: !task.done } : task));

  const grouped: Record<string, typeof studyPlanData> = {};
  tasks.forEach((t) => { if (!grouped[t.date]) grouped[t.date] = []; grouped[t.date].push(t); });

  const done = tasks.filter((t) => t.done).length;

  return (
    <div className="p-6 space-y-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--lm-text)]" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>My Study Plan</h2>
          <p className="text-sm text-[var(--lm-text-faint)]">AI-generated schedule tailored to your goals</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="ghost" size="sm"><RefreshCw size={13} /> Regenerate</Btn>
          <Btn variant="gradient" size="sm"><Plus size={13} /> Add Task</Btn>
        </div>
      </div>

      <div className="rounded-2xl p-5 text-white flex items-center gap-5" style={{ background: `linear-gradient(135deg, ${IND}, ${PRP})` }}>
        <div className="flex-1">
          <p className="text-indigo-200 text-xs mb-1 font-medium">{"This Week's Completion"}</p>
          <p className="text-3xl font-extrabold mb-2">{done}/{tasks.length} Tasks</p>
          <div className="h-2.5 bg-[var(--lm-card-bg)]/20 rounded-full overflow-hidden">
            <div className="h-full bg-[var(--lm-card-bg)] rounded-full transition-all" style={{ width: `${(done / tasks.length) * 100}%` }} />
          </div>
        </div>
        <div className="text-center">
          <p className="text-4xl font-extrabold">{Math.round((done / tasks.length) * 100)}%</p>
          <p className="text-indigo-200 text-xs">Complete</p>
        </div>
      </div>

      {Object.entries(grouped).map(([date, dateTasks]) => (
        <div key={date} className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--lm-border)] bg-[#FAF8FF]">
            <Calendar size={14} style={{ color: PRP }} />
            <span className="text-xs font-bold text-[var(--lm-text)]">{date}</span>
            <span className="text-xs text-[var(--lm-text-faint)]">{dateTasks.filter((t) => t.done).length}/{dateTasks.length} done</span>
          </div>
          <div className="divide-y divide-[rgba(109,40,217,0.05)]">
            {dateTasks.map((task) => (
              <div key={task.id} className={`flex items-start gap-4 px-5 py-4 transition-colors ${task.done ? "bg-[#F9FFF9]" : "hover:bg-[#FAF8FF]"}`}>
                <button onClick={() => toggle(task.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${task.done ? "border-[#059669] bg-[#059669]" : "border-[#C4B5FD] hover:border-[#7C3AED]"}`}>
                  {task.done && <Check size={11} className="text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold leading-tight ${task.done ? "text-[var(--lm-text-faint)] line-through" : "text-[var(--lm-text)]"}`}>{task.title}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-xs text-[var(--lm-text-faint)] flex items-center gap-1"><BookOpen size={10} />{task.course}</span>
                    <span className="text-xs text-[var(--lm-text-faint)] flex items-center gap-1"><Clock size={10} />{task.time}</span>
                  </div>
                </div>
                <Badge color={task.priority === "High" ? "red" : task.priority === "Medium" ? "amber" : "gray"}>{task.priority}</Badge>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

