import { useState, useEffect } from "react";
import { Bot, Cpu, Database, Server, UserCheck, Users, FileText, Trash2 } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, ResponsiveContainer } from "recharts";
import { PRP, PRPL, IND } from "@/app/lib/constants";
import { Badge, StatCard } from "@/app/components/shared";
import { listAdminUsers, updateUserRole, deleteUser, getAiConfig, setAiProvider, setOllamaModel, ApiError, type AdminUserResponse, type AiConfigResponse } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";

const SYS_ITEMS: { label: string; icon: React.ElementType; ok: boolean }[] = [
  { label: "Web Servers", icon: Server,   ok: true },
  { label: "Database",    icon: Database, ok: true },
  { label: "AI Engine",   icon: Cpu,      ok: true },
];

const ROLES: AdminUserResponse["role"][] = ["STUDENT", "LECTURER", "ADMIN"];

export default function AdminPage() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- AI provider/model config (live switch, no restart needed) ---
  const [aiConfig, setAiConfig] = useState<AiConfigResponse | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getAiConfig(token)
      .then(setAiConfig)
      .catch(() => setAiError("Could not read AI configuration. Is the AI service running?"));
  }, [token]);

  async function handleProviderChange(provider: "gemini" | "ollama") {
    if (!token) return;
    setAiBusy(true);
    setAiError(null);
    try {
      await setAiProvider(provider, token);
      setAiConfig((c) => (c ? { ...c, llm_provider: provider } : c));
    } catch (err) {
      setAiError(err instanceof ApiError ? err.message : "Could not switch provider.");
    } finally {
      setAiBusy(false);
    }
  }

  async function handleModelChange(model: string) {
    if (!token) return;
    setAiBusy(true);
    setAiError(null);
    try {
      await setOllamaModel(model, token);
      setAiConfig((c) => (c ? { ...c, ollama_model: model } : c));
    } catch (err) {
      setAiError(err instanceof ApiError ? err.message : "Could not switch model.");
    } finally {
      setAiBusy(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    listAdminUsers(token)
      .then(setUsers)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load users."))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleRoleChange(userId: string, newRole: AdminUserResponse["role"]) {
    if (!token) return;
    setError(null);
    try {
      const updated = await updateUserRole(userId, newRole, token);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update role.");
    }
  }

  async function handleDelete(userId: string) {
    if (!token) return;
    if (!window.confirm("Delete this user? This can't be undone.")) return;
    setError(null);
    try {
      await deleteUser(userId, token);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete user.");
    }
  }

  return (
    <div className="p-6 space-y-5">
      {/* Stat cards — note: these are illustrative, not wired to real metrics yet */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={String(users.length)} delta="" icon={Users} color={PRP} bg={PRPL} />
        <StatCard label="Students" value={String(users.filter((u) => u.role === "STUDENT").length)} delta="" icon={UserCheck} color={IND} bg="#EEF2FF" />
        <StatCard label="Lecturers" value={String(users.filter((u) => u.role === "LECTURER").length)} delta="" icon={FileText} color="#2563EB" bg="#EFF6FF" />
        <StatCard label="Admins" value={String(users.filter((u) => u.role === "ADMIN").length)} delta="" icon={Bot} color="#F59E0B" bg="#FFFBEB" />
      </div>

      {/* System health — illustrative/mock, kept for dashboard completeness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-5 shadow-sm">
          <h3 className="font-bold text-[var(--lm-text)] text-sm mb-4">AI Usage — Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={[{day:"Jun 1",q:62000},{day:"Jun 8",q:71000},{day:"Jun 15",q:68000},{day:"Jun 22",q:79000},{day:"Jun 25",q:84271}]}>
              <defs>
                <linearGradient id="aiGr" x1="0" y1="0" x2="0" y2="1">
                  <stop key="s1" offset="5%" stopColor={PRP} stopOpacity={0.2} />
                  <stop key="s2" offset="95%" stopColor={PRP} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid key="cg" strokeDasharray="3 3" stroke="rgba(109,40,217,0.05)" />
              <XAxis key="x" dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis key="y" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip key="tt" contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area key="area" type="monotone" dataKey="q" stroke={PRP} strokeWidth={2} fill="url(#aiGr)" name="Queries" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--lm-text)] text-sm">System Health</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-xs text-[#059669] font-semibold">All Operational</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[var(--lm-border)]">
            {SYS_ITEMS.map(({ label, icon: Icon, ok }) => (
              <div key={label} className="bg-[#FAF8FF] rounded-xl p-3 text-center">
                <Icon size={18} className={`mx-auto mb-1 ${ok ? "text-[#10B981]" : "text-[#EF4444]"}`} />
                <p className="text-[10px] text-[var(--lm-text-faint)]">{label}</p>
                <p className={`text-[10px] font-bold ${ok ? "text-[#059669]" : "text-[#DC2626]"}`}>{ok ? "Online" : "Offline"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Engine Configuration — REAL, live switch (no restart) */}
      <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Cpu size={16} className="text-[#7C3AED]" />
          <h3 className="font-bold text-[var(--lm-text)] text-sm">AI Engine Configuration</h3>
        </div>
        <p className="text-xs text-[var(--lm-text-faint)] mb-4">
          Switch between the cloud model and a locally hosted model. Takes effect immediately.
        </p>

        {aiError && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{aiError}</div>}
        {!aiConfig && !aiError && <p className="text-sm text-[var(--lm-text-faint)]">Loading AI configuration…</p>}

        {aiConfig && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--lm-text-muted)] mb-2">Provider</label>
              <div className="flex gap-2">
                {(["gemini", "ollama"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    disabled={aiBusy}
                    onClick={() => handleProviderChange(p)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors disabled:opacity-50 ${
                      aiConfig.llm_provider === p
                        ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                        : "bg-[var(--lm-surface)] text-[var(--lm-text-muted)] border-[var(--lm-border)] hover:bg-[var(--lm-surface-mid)]"
                    }`}
                  >
                    {p === "gemini" ? "Gemini (cloud)" : "Ollama (local)"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--lm-text-muted)] mb-2">
                Local model {aiConfig.llm_provider !== "ollama" && <span className="font-normal text-[var(--lm-text-faint)]">(used when Ollama is active)</span>}
              </label>
              <select
                value={aiConfig.ollama_model}
                disabled={aiBusy}
                onChange={(e) => handleModelChange(e.target.value)}
                className="bg-[var(--lm-surface)] rounded-xl px-3 py-2 text-xs outline-none text-[var(--lm-text)] border border-[var(--lm-border)] disabled:opacity-50"
              >
                {aiConfig.available_ollama_models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <p className="text-[11px] text-[var(--lm-text-faint)] pt-1 border-t border-[var(--lm-border)]">
              Currently answering with:{" "}
              <span className="font-semibold text-[var(--lm-text-muted)]">
                {aiConfig.llm_provider === "gemini" ? "Gemini (cloud)" : aiConfig.ollama_model + " (local)"}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* User Management — REAL data */}
      <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[var(--lm-border)]">
          <h3 className="font-bold text-[var(--lm-text)] text-sm">User Management</h3>
        </div>

        {error && <div className="m-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}
        {loading && <p className="p-5 text-sm text-[var(--lm-text-faint)]">Loading users…</p>}

        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FAF8FF]">
                <tr>{["User", "Email", "Role", "Joined", ""].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-bold text-[var(--lm-text-faint)]">{h}</th>)}</tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.userId;
                  return (
                    <tr key={u.id} className="border-t border-[rgba(109,40,217,0.05)] hover:bg-[#FAF8FF] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold">
                            {u.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-[var(--lm-text)]">
                            {u.fullName}{isSelf && <span className="text-[10px] text-[var(--lm-text-faint)] ml-1">(you)</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-[var(--lm-text-faint)]">{u.email}</td>
                      <td className="px-5 py-3.5">
                        {isSelf ? (
                          <Badge color="purple">{u.role}</Badge>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as AdminUserResponse["role"])}
                            className="bg-[var(--lm-surface)] rounded-lg px-2 py-1 text-xs outline-none text-[var(--lm-text)]"
                          >
                            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-[var(--lm-text-faint)]">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5">
                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() => handleDelete(u.id)}
                            className="p-1.5 rounded-lg hover:bg-[#FEF2F2] text-[var(--lm-text-muted)] hover:text-[#DC2626] transition-colors"
                            title="Delete user"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}