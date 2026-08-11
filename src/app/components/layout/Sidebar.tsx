import { BookOpen, BarChart3, Target, ChevronRight, ChevronLeft, Home, HelpCircle, Lightbulb, User, LogOut, Plus, Calendar, Bot, Folder } from "lucide-react";
import { PRP } from "@/app/lib/constants";
import { useAuth } from "@/app/context/AuthContext";

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const studentNav = [
  { id: "dashboard",          label: "Dashboard",        icon: Home },
  { id: "courses",            label: "My Courses",        icon: BookOpen },
  { id: "resources",          label: "Resources",         icon: Folder },
  { id: "ai-tutor",           label: "AI Tutor",          icon: Bot },
  { id: "ai-recommendations", label: "Recommendations",   icon: Lightbulb },
  { id: "progress",           label: "Progress",          icon: BarChart3 },
  { id: "skills",             label: "Skills",            icon: Target },
  { id: "quiz",               label: "Quiz Center",       icon: HelpCircle },
];
const lecturerNav = [
  { id: "lecturer",  label: "Dashboard", icon: Home },
  { id: "courses",   label: "Courses", icon: BookOpen },
  { id: "resources", label: "Resources", icon: Folder },
  { id: "quiz",      label: "Quiz Center", icon: HelpCircle },
  { id: "progress",  label: "Analytics", icon: BarChart3 },
];
const adminNav = [
  { id: "admin",    label: "Dashboard", icon: Home },
  { id: "progress", label: "Analytics", icon: BarChart3 },
];

export function Sidebar({ page, setPage, role, collapsed, setCollapsed }: {
  page: string; setPage: (p: string) => void;
  role: string;
  collapsed: boolean; setCollapsed: (v: boolean) => void;
}) {
  const nav = role === "admin" ? adminNav : role === "lecturer" ? lecturerNav : studentNav;
  const { logout } = useAuth();
  return (
    <aside className={`h-full bg-[var(--lm-card-bg)] border-r border-[var(--lm-border)] flex flex-col transition-all duration-300 flex-shrink-0 ${collapsed ? "w-16" : "w-60"}`}>
      {/* Logo */}
      <div className="h-16 flex items-center px-3 border-b border-[var(--lm-border)] gap-2.5">
        <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center">
          <Bot size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="font-extrabold text-[15px] text-[var(--lm-text)] leading-tight" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Learn<span style={{ color: PRP }}>Mate</span>
            </p>
            <p className="text-[9px] text-[var(--lm-text-faint)] font-medium tracking-wider uppercase">AI Learning Platform</p>
          </div>
        )}
        <button className="ml-auto p-1 text-[var(--lm-text-faint)] hover:text-[var(--lm-text)] transition-colors flex-shrink-0" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>
      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {nav.map(({ id, label, icon: Icon }) => {
          const active = page === id;
          return (
            <button key={id} onClick={() => setPage(id)} title={collapsed ? label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${active ? "bg-[var(--lm-surface)] text-[#7C3AED]" : "text-[var(--lm-text-muted)] hover:bg-[var(--lm-surface)] hover:text-[var(--lm-text)]"}`}>
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
              {!collapsed && active && <span className="ml-auto w-1.5 h-4 rounded-full bg-[#7C3AED]" />}
            </button>
          );
        })}
      </nav>
      {/* Bottom */}
      <div className="border-t border-[var(--lm-border)] p-2 space-y-0.5">
        <button onClick={() => setPage("profile")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${page === "profile" ? "bg-[var(--lm-surface)] text-[#7C3AED]" : "text-[var(--lm-text-muted)] hover:bg-[var(--lm-surface)] hover:text-[var(--lm-text)]"}`}>
          <User size={18} className="flex-shrink-0" />
          {!collapsed && "Profile"}
        </button>
        <button
          onClick={() => {
            logout();
            setPage("landing");
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--lm-text-muted)] hover:bg-[var(--lm-danger-surface)] hover:text-[#DC2626] transition-all text-left">
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}

