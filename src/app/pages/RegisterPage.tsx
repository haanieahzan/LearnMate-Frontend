import { useState } from "react";
import { ArrowRight, User, GraduationCap, Lock, Mail, Building, CheckSquare } from "lucide-react";
import { PRP } from "@/app/lib/constants";
import { Btn, Field } from "@/app/components/shared";
import { AuthShell } from "@/app/components/auth/AuthShell";
import { register, ApiError } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";

// ─── Register page ────────────────────────────────────────────────────────────
//
// Note: Student ID, University, and Degree Programme are collected here but
// not yet sent to the backend — the `users` table only stores email,
// password, fullName, and role right now. Add columns + wire these through
// once you need them (e.g. in Week 2 when building student profiles).

export default function RegisterPage({ setPage }: { setPage: (p: string) => void }) {
  const { setAuth } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "LECTURER">("STUDENT");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in your name, email, and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await register(email, password, `${firstName} ${lastName}`, role);
      setAuth(res);
      setPage("dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[var(--lm-text)] mb-1" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Create account</h1>
          <p className="text-sm text-[var(--lm-text-muted)]">Start your AI-powered learning journey</p>
        </div>
        <div className="space-y-3.5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" placeholder="Emma" icon={User} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Field label="Last Name" placeholder="Thompson" icon={User} value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <Field label="University Email" type="email" placeholder="you@university.ac.uk" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} />

          <div>
            <label className="block text-sm font-semibold text-[var(--lm-text)] mb-1.5">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setRole("STUDENT")}
                className={`rounded-xl py-3 text-sm font-semibold border transition-all ${role === "STUDENT" ? "bg-[#7C3AED] text-white border-[#7C3AED]" : "bg-[var(--lm-card-bg)] text-[var(--lm-text-muted)] border-[rgba(109,40,217,0.15)]"}`}>
                Student
              </button>
              <button type="button" onClick={() => setRole("LECTURER")}
                className={`rounded-xl py-3 text-sm font-semibold border transition-all ${role === "LECTURER" ? "bg-[#7C3AED] text-white border-[#7C3AED]" : "bg-[var(--lm-card-bg)] text-[var(--lm-text-muted)] border-[rgba(109,40,217,0.15)]"}`}>
                Lecturer
              </button>
            </div>
          </div>

          {role === "STUDENT" && (
            <Field label="Student ID" placeholder="STU2024001" icon={CheckSquare} />
          )}
          <div>
            <label htmlFor="university" className="block text-sm font-semibold text-[#1E1B4B] mb-1.5">University</label>
            <div className="relative">
              <Building size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <select id="university" className="w-full bg-white border border-[rgba(109,40,217,0.15)] rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#7C3AED]/25 text-[#1E1B4B]">
                <option>Select your university</option>
                <option>University of Ruhuna</option>
                <option>University of Colombo</option>
                <option>University of Moratuwa</option>
              </select>
            </div>
          </div>
          {role === "STUDENT" && (
            <Field label="Degree Programme" placeholder="BSc Computer Science" icon={GraduationCap} />
          )}

          <Field label="Password" type="password" placeholder="Min. 8 characters" icon={Lock} value={password} onChange={(e) => setPassword(e.target.value)} />
          <Field label="Confirm Password" type="password" placeholder="Repeat password" icon={Lock} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <div className="flex items-start gap-2">
            <input type="checkbox" id="terms-agreement" className="w-4 h-4 mt-0.5 rounded accent-purple-600" />
            <label htmlFor="terms-agreement" className="text-xs text-[var(--lm-text-muted)] leading-relaxed">
              I agree to the <span className="font-semibold" style={{ color: PRP }}>Terms of Service</span> and{" "}
              <span className="font-semibold" style={{ color: PRP }}>Privacy Policy</span>
            </label>
          </div>
          <Btn variant="gradient" className="w-full justify-center" onClick={handleRegister} disabled={loading}>
            {loading ? "Creating account…" : "Create Account"} <ArrowRight size={15} />
          </Btn>
        </div>
        <div className="mt-5 pt-5 border-t border-[var(--lm-border)] text-center">
          <p className="text-sm text-[var(--lm-text-muted)]">
            Already have an account?{" "}
            <button onClick={() => setPage("login")} className="font-bold hover:underline" style={{ color: PRP }}>Sign in</button>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
