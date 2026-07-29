import { useState } from "react";
import { ChevronLeft, Lock, Mail } from "lucide-react";
import { PRP } from "@/app/lib/constants";
import { Btn, Field } from "@/app/components/shared";
import { AuthShell } from "@/app/components/auth/AuthShell";
import { login, ApiError } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";

// ─── Login page ───────────────────────────────────────────────────────────────

export default function LoginPage({ setPage }: { setPage: (p: string) => void }) {
  const { setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    setLoading(true);
    try {
      const res = await login(email, password);
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
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-[var(--lm-text)] mb-1" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Welcome back</h1>
          <p className="text-sm text-[var(--lm-text-muted)]">Sign in to your LearnMate account</p>
        </div>
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
          )}
          <Field label="Email Address" type="email" placeholder="you@university.ac.uk" icon={Mail}
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field label="Password" type="password" placeholder="Enter your password" icon={Lock}
            value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded accent-purple-600" />
              <span className="text-sm text-[var(--lm-text-muted)]">Remember me</span>
            </label>
            <button className="text-sm font-semibold hover:underline" style={{ color: PRP }}>Forgot password?</button>
          </div>
          <Btn variant="gradient" className="w-full justify-center" onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in…" : "Login"}
          </Btn>
        </div>
        <div className="mt-6 pt-6 border-t border-[var(--lm-border)] text-center">
          <p className="text-sm text-[var(--lm-text-muted)]">
            {"Don't have an account? "}
            <button onClick={() => setPage("register")} className="font-bold hover:underline" style={{ color: PRP }}>Sign up</button>
          </p>
        </div>
        <div className="mt-3 text-center">
          <button onClick={() => setPage("landing")} className="text-xs text-[var(--lm-text-faint)] hover:text-[var(--lm-text-muted)] flex items-center gap-1 mx-auto">
            <ChevronLeft size={12} /> Back to home
          </button>
        </div>
      </div>
    </AuthShell>
  );
}
