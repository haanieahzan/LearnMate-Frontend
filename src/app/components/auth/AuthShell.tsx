import { Check, Plus } from "lucide-react";
import logo from "@/imports/logo.png";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

// ─── Auth shell ───────────────────────────────────────────────────────────────

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter',sans-serif" }}>
      <div className="hidden lg:flex w-2/5 bg-gradient-to-br from-[#312E81] via-[#4F46E5] to-[#7C3AED] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-[var(--lm-card-bg)]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-0 w-80 h-80 bg-[#7C3AED]/40 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-8 bg-[var(--lm-card-bg)]/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
            <ImageWithFallback src={logo} alt="LearnMate Logo" className="w-50 h-50 object-contain" />
          </div>
          <p className="text-indigo-200 text-xs font-medium tracking-wider uppercase mb-2">AI-Powered Personalised</p>
          <h2 className="text-2xl font-extrabold text-white leading-snug" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Learning Support Platform
          </h2>
          <div className="mt-8 space-y-3 text-left w-full max-w-xs">
            {["AI-powered document analysis", "Personalised study recommendations", "Auto-generated quizzes", "Skill gap analysis and tracking"].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[var(--lm-card-bg)]/20 flex items-center justify-center flex-shrink-0"><Check size={10} className="text-white" /></div>
                <span className="text-sm text-indigo-100">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-[#FAF8FF]">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

