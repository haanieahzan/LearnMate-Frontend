import { TrendingUp, TrendingDown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { PRP, PRPM, DARK } from "@/app/lib/constants";

export function Btn({ children, variant = "primary", size = "md", onClick, className = "", disabled = false }: {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost" | "danger" | "gradient";
  size?: "sm" | "md" | "lg";
  onClick?: () => void; className?: string; disabled?: boolean;
}) {
  const base = "inline-flex items-center gap-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-5 py-2.5 text-sm", lg: "px-7 py-3.5 text-base" };
  const variants: Record<string, string> = {
    primary:  "bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-sm",
    outline:  "border border-[#7C3AED] text-[#7C3AED] hover:bg-[var(--lm-surface)]",
    ghost:    "text-[var(--lm-text-muted)] hover:bg-[var(--lm-surface)] hover:text-[var(--lm-text)]",
    danger:   "bg-[#EF4444] text-white hover:bg-[#DC2626]",
    gradient: "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white hover:opacity-90 shadow-md",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function Badge({ children, color = "purple" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    purple: "bg-[var(--lm-surface)] text-[#7C3AED]", indigo: "bg-[#EEF2FF] text-[#4338CA]",
    blue: "bg-[#EFF6FF] text-[#2563EB]", teal: "bg-[#F0FDFA] text-[#0D9488]",
    amber: "bg-[#FFFBEB] text-[#D97706]", red: "bg-[#FEF2F2] text-[#DC2626]",
    green: "bg-[#ECFDF5] text-[#059669]", gray: "bg-[#F9FAFB] text-[var(--lm-text-muted)]",
  };
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors[color] ?? colors.purple}`}>{children}</span>;
}

export function TypeBadge({ type }: { type: string }) {
  const s: Record<string, string> = { PDF: "bg-[#FEF2F2] text-[#DC2626]", DOCX: "bg-[#EFF6FF] text-[#2563EB]", PPTX: "bg-[#FFFBEB] text-[#D97706]" };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${s[type] ?? "bg-gray-100 text-gray-600"}`}>{type}</span>;
}

export function StatCard({ label, value, delta, icon: Icon, color, bg }: {
  label: string; value: string; delta?: string; icon: React.ElementType; color: string; bg: string;
}) {
  return (
    <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-5 shadow-sm flex items-start gap-4">
      <div className="rounded-xl p-3 flex-shrink-0" style={{ backgroundColor: bg }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[var(--lm-text-muted)] font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold text-[var(--lm-text)] leading-tight">{value}</p>
        {delta && (
          <p className={`text-xs mt-1 font-medium flex items-center gap-1 ${delta.startsWith("+") ? "text-[#059669]" : "text-[#EF4444]"}`}>
            {delta.startsWith("+") ? <TrendingUp size={11} /> : <TrendingDown size={11} />}{delta} this week
          </p>
        )}
      </div>
    </div>
  );
}

export function DonutChart({ pct }: { pct: number }) {
  const data = [{ value: pct }, { value: 100 - pct }];
  return (
    <div className="relative mx-auto" style={{ width: 200, height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={72} outerRadius={92}
            startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
            <Cell key="donut-filled" fill={PRP} />
            <Cell key="donut-empty" fill={PRPM} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-4xl font-extrabold" style={{ color: DARK, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{pct}%</span>
        <span className="text-xs text-[var(--lm-text-muted)] mt-0.5">Completed</span>
      </div>
    </div>
  );
}

export function Field({ label, type = "text", placeholder, icon: Icon, value, onChange, name }: {
  label: string; type?: string; placeholder: string; icon?: React.ElementType;
  value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; name?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[var(--lm-text)] mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--lm-text-faint)]" />}
        <input type={type} placeholder={placeholder} name={name} value={value} onChange={onChange}
          className={`w-full bg-[var(--lm-card-bg)] border border-[rgba(109,40,217,0.15)] rounded-xl py-3 text-sm outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED] text-[var(--lm-text)] placeholder:text-[var(--lm-text-faint)] transition-all ${Icon ? "pl-10 pr-4" : "px-4"}`} />
      </div>
    </div>
  );
}

