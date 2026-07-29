import { BarChart3, Target, Award, ArrowRight, HelpCircle, Plus, CheckCircle, Flame, Trophy, Bot, Sparkles, FileText } from "lucide-react";
import { PRP, PRPL, IND } from "@/app/lib/constants";
import { Btn, Badge } from "@/app/components/shared";
import learnmateLogo from "@/imports/learnmatesymbol.png";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import logo from "@/imports/logo.png";

// ─── Landing page ─────────────────────────────────────────────────────────────

export default function LandingPage({ setPage }: { setPage: (p: string) => void }) {
  const features = [
    { icon: Bot,       title: "AI-Powered Q&A",          desc: "Ask questions in natural language and get cited answers from your study materials.", c: PRP, bg: PRPL },
    { icon: FileText,  title: "Smart Doc Analysis",       desc: "Upload PDFs, Word docs, and slides. LearnMate extracts concepts and summaries.", c: IND, bg: "#EEF2FF" },
    { icon: Target,    title: "Personalised Learning",    desc: "Adaptive AI that learns your strengths and weaknesses to deliver tailored recommendations.", c: "#2563EB", bg: "#EFF6FF" },
    { icon: HelpCircle,title: "Auto Quiz Generation",     desc: "Auto-generate contextual quizzes from your materials to test comprehension.", c: "#F59E0B", bg: "#FFFBEB" },
    { icon: Award,     title: "Skills Assessment",        desc: "Track confidence across 9 academic skills and receive AI-curated improvement pathways.", c: "#EF4444", bg: "#FEF2F2" },
    { icon: BarChart3, title: "Learning Analytics",       desc: "Visualise study patterns, quiz scores, and confidence growth with rich dashboards.", c: "#059669", bg: "#ECFDF5" },
  ];
  return (
    <div className="min-h-screen bg-[var(--lm-card-bg)]" style={{ fontFamily: "'Inter',sans-serif" }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--lm-card-bg)]/90 backdrop-blur-md border-b border-[var(--lm-border)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center">
              <Bot size={17} className="text-white" />
            </div>
            <span className="font-extrabold text-[var(--lm-text)] text-base" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Learn<span style={{ color: PRP }}>Mate</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 ml-4 text-sm text-[var(--lm-text-muted)] font-medium">
            {["Features", "How it Works", "Testimonials"].map((l) => <a key={l} href="#" className="hover:text-[var(--lm-text)] transition-colors">{l}</a>)}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Btn variant="ghost" size="sm" onClick={() => setPage("login")}>Sign In</Btn>
            <Btn variant="gradient" size="sm" onClick={() => setPage("register")}>Get Started Free</Btn>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 min-h-screen flex items-center bg-gradient-to-br from-white via-[#FAF8FF] to-[#F0EDFF] relative overflow-hidden">
        <div className="absolute top-40 right-0 w-[600px] h-[600px] bg-[#7C3AED]/6 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 py-20 flex items-center gap-16 relative z-10">
          <div className="flex-1 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-[#EDE9FE] border border-[#C4B5FD] rounded-full px-4 py-1.5 mb-6">
              <Sparkles size={13} style={{ color: PRP }} />
              <span className="text-xs font-bold" style={{ color: PRP }}>AI-Powered Learning Platform</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-[var(--lm-text)] leading-[1.08] mb-5" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Learn Smarter,<br /><span style={{ color: PRP }}>Achieve Better</span>
            </h1>
            <p className="text-lg text-[var(--lm-text-muted)] leading-relaxed mb-8">
              LearnMate analyses your study materials, answers your questions, and personalises your learning journey using advanced Retrieval-Augmented Generation.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              <Btn size="lg" variant="gradient" onClick={() => setPage("register")}>Start Learning Free <ArrowRight size={17} /></Btn>
              <Btn size="lg" variant="outline" onClick={() => setPage("login")}>Sign In</Btn>
            </div>
            <div className="flex items-center gap-5 text-sm text-[var(--lm-text-muted)]">
              {["No credit card", "Free for students", "Cancel anytime"].map((f) => (
                <div key={f} className="flex items-center gap-1.5"><CheckCircle size={15} className="text-[#059669]" />{f}</div>
              ))}
            </div>
          </div>
          {/* Logo hero */}
          <div className="hidden lg:flex flex-1 justify-center items-center relative">
            <div className="relative">
              <ImageWithFallback src={logo} alt="LearnMate AI Learning Platform Logo"
                className="w-72 h-72 object-contain drop-shadow-2xl" />
              <div className="absolute -top-4 -right-8 bg-[var(--lm-card-bg)] border border-[rgba(109,40,217,0.12)] rounded-2xl shadow-lg p-3.5 flex items-center gap-3">
                <Trophy size={18} className="text-[#F59E0B]" />
                <div><p className="text-xs font-bold text-[var(--lm-text)]">Quiz Score</p><p className="text-sm font-extrabold text-[#059669]">92%</p></div>
              </div>
              <div className="absolute -bottom-4 -left-8 bg-[var(--lm-card-bg)] border border-[rgba(109,40,217,0.12)] rounded-2xl shadow-lg p-3.5 flex items-center gap-3">
                <Flame size={18} className="text-[#EF4444]" />
                <div><p className="text-xs font-bold text-[var(--lm-text)]">Study Streak</p><p className="text-sm font-extrabold text-[#EF4444]">14 days</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#1E1B4B] py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[["12,000+", "Active Students"], ["60+", "Partner Universities"], ["2.4M+", "Documents Analysed"], ["98%", "Satisfaction Rate"]].map(([n, l]) => (
            <div key={l} className="text-center">
              <p className="text-3xl font-extrabold text-white mb-1" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{n}</p>
              <p className="text-sm text-[#8B85C1]">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-[#FAF8FF]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <Badge color="purple">Features</Badge>
            <h2 className="text-4xl font-extrabold text-[var(--lm-text)] mt-4 mb-3" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Everything you need to excel</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, c, bg }) => (
              <div key={title} className="bg-[var(--lm-card-bg)] rounded-2xl border border-[rgba(109,40,217,0.07)] p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: bg }}>
                  <Icon size={21} style={{ color: c }} />
                </div>
                <h3 className="text-base font-bold text-[var(--lm-text)] mb-2" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{title}</h3>
                <p className="text-sm text-[var(--lm-text-muted)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Ready to transform how you study?</h2>
          <p className="text-lg text-indigo-100 mb-8">Join 12,000+ students already using LearnMate.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => setPage("register")} className="bg-[var(--lm-card-bg)] text-[#7C3AED] px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2 shadow-lg">
              Get Started Free <ArrowRight size={17} />
            </button>
            <button onClick={() => setPage("login")} className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-[var(--lm-card-bg)]/10 transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1E1B4B] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center"><Bot size={14} className="text-white" /></div>
            <span className="font-bold text-white text-sm" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>LearnMate</span>
          </div>
          <p className="text-xs text-[var(--lm-text-muted)]">© 2026 LearnMate AI. LEARN SMARTER, ACHIEVE BETTER.</p>
        </div>
      </footer>
    </div>
  );
}

