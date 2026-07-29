import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { Search, Bell, Moon, Sun } from "lucide-react";
import { Sidebar } from "@/app/components/layout/Sidebar";
import { useGoTo } from "@/app/router/useGoTo";
import { pathToPage } from "@/app/router/pageRoutes";
import { useAppState } from "@/app/context/AppStateContext";
import { useAuth } from "@/app/context/AuthContext";

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard", courses: "My Courses", resources: "Resources",
  "ai-tutor": "AI Tutor", "ai-recommendations": "AI Recommendations",
  progress: "Progress & Analytics", "study-plan": "Study Plan",
  skills: "Skills Assessment", quiz: "Quiz Center", profile: "My Profile",
  lecturer: "Lecturer Dashboard", admin: "Admin Dashboard",
};

/**
 * Wraps every /app/* route. Pulls role/darkMode from shared context and the
 * current "page name" from the URL, then renders the matched child route via
 * <Outlet />. This replaces the original prototype's children-prop pattern.
 */
export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { darkMode, setDarkMode } = useAppState();
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() ?? "student";
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);
  const location = useLocation();
  const goTo = useGoTo();
  const page = pathToPage(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--lm-page-bg)]">
      <Sidebar page={page} setPage={goTo} role={role} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[var(--lm-card-bg)] border-b border-[var(--lm-border)] flex items-center gap-4 px-6 flex-shrink-0">
          <h1 className="text-base font-bold text-[var(--lm-text)] flex-1" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            {PAGE_TITLES[page] ?? "LearnMate"}
          </h1>
          <div className="flex items-center gap-2.5">
            <div className="relative hidden lg:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--lm-text-faint)]" />
              <input placeholder="Search…" className="bg-[var(--lm-surface)] rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#7C3AED]/20 w-44 text-[var(--lm-text)] placeholder:text-[var(--lm-text-faint)]" />
            </div>
            <button type="button" aria-label="Notifications" className="relative p-2 rounded-xl hover:bg-[var(--lm-surface)] text-[var(--lm-text-muted)] transition-colors">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#EF4444] rounded-full" />
            </button>
            <button type="button" onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl hover:bg-[var(--lm-surface)] text-[var(--lm-text-muted)] transition-colors">
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <div className="flex items-center gap-2.5 cursor-pointer pl-2 border-l border-[var(--lm-border)]" onClick={() => goTo("profile")}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold">{user?.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}</div>
              <div className="hidden lg:block">
                <p className="text-xs font-bold text-[var(--lm-text)] leading-tight">{user?.fullName}</p>
                <p className="text-[10px] text-[var(--lm-text-faint)]">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
