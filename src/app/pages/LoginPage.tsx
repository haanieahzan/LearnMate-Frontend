import { useState } from "react";
import { ChevronLeft, Lock, Mail, KeyRound, CheckCircle } from "lucide-react";
import { PRP } from "@/app/lib/constants";
import { Btn, Field } from "@/app/components/shared";
import { AuthShell } from "@/app/components/auth/AuthShell";
import { login, forgotPassword, resetPassword, ApiError } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";

// ─── Login page ───────────────────────────────────────────────────────────────

export default function LoginPage({ setPage }: { setPage: (p: string) => void }) {
  const { setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot password flow
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotBusy, setForgotBusy] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetDone, setResetDone] = useState(false);

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

  async function handleForgotSubmit() {
    if (!forgotEmail.trim()) return;
    setForgotBusy(true);
    setForgotMessage(null);
    try {
      const res = await forgotPassword(forgotEmail.trim());
      setForgotMessage(res.message);
      setResetToken(res.resetToken ?? null);
    } catch (err) {
      setForgotMessage(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setForgotBusy(false);
    }
  }

  async function handleResetSubmit() {
    if (!resetToken || !newPassword.trim()) return;
    setForgotBusy(true);
    setForgotMessage(null);
    try {
      await resetPassword(resetToken, newPassword.trim());
      setResetDone(true);
    } catch (err) {
      setForgotMessage(err instanceof ApiError ? err.message : "Could not reset your password.");
    } finally {
      setForgotBusy(false);
    }
  }

  function closeForgotPanel() {
    setShowForgot(false);
    setForgotEmail("");
    setForgotMessage(null);
    setResetToken(null);
    setNewPassword("");
    setResetDone(false);
  }

  return (
    <AuthShell>
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-[var(--lm-text)] mb-1" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Welcome back</h1>
          <p className="text-sm text-[var(--lm-text-muted)]">Sign in to your LearnMate account</p>
        </div>

        {!showForgot ? (
          <>
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
                <button onClick={() => setShowForgot(true)} className="text-sm font-semibold hover:underline" style={{ color: PRP }}>
                  Forgot password?
                </button>
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
          </>
        ) : (
          <div className="space-y-4">
            <button onClick={closeForgotPanel} className="text-xs text-[var(--lm-text-faint)] hover:text-[var(--lm-text-muted)] flex items-center gap-1">
              <ChevronLeft size={12} /> Back to login
            </button>

            {resetDone ? (
              <div className="text-center py-4">
                <CheckCircle size={32} className="text-[#059669] mx-auto mb-3" />
                <p className="text-sm font-semibold text-[var(--lm-text)] mb-1">Password reset successfully</p>
                <p className="text-xs text-[var(--lm-text-faint)] mb-4">You can now log in with your new password.</p>
                <Btn variant="gradient" onClick={closeForgotPanel}>Back to Login</Btn>
              </div>
            ) : !resetToken ? (
              <>
                <div>
                  <h2 className="text-lg font-bold text-[var(--lm-text)] mb-1">Reset your password</h2>
                  <p className="text-xs text-[var(--lm-text-faint)]">Enter your account email to get a reset link.</p>
                </div>
                {forgotMessage && (
                  <div className="bg-[var(--lm-surface)] text-[var(--lm-text)] text-sm rounded-xl px-4 py-3">{forgotMessage}</div>
                )}
                <Field label="Email Address" type="email" placeholder="you@university.ac.uk" icon={Mail}
                  value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
                <Btn variant="gradient" className="w-full justify-center" onClick={handleForgotSubmit} disabled={forgotBusy}>
                  {forgotBusy ? "Sending…" : "Send Reset Link"}
                </Btn>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-lg font-bold text-[var(--lm-text)] mb-1">Set a new password</h2>
                  <p className="text-xs text-[var(--lm-text-faint)]">
                    Demo mode: normally this link would be emailed — here it's shown directly below.
                  </p>
                </div>
                {forgotMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{forgotMessage}</div>
                )}
                <div className="bg-[var(--lm-surface)] rounded-xl px-4 py-3 flex items-center gap-2">
                  <KeyRound size={14} className="text-[#7C3AED] flex-shrink-0" />
                  <span className="text-xs text-[var(--lm-text-faint)] break-all">Reset token: {resetToken}</span>
                </div>
                <Field label="New Password" type="password" placeholder="Min. 8 characters" icon={Lock}
                  value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <Btn variant="gradient" className="w-full justify-center" onClick={handleResetSubmit} disabled={forgotBusy}>
                  {forgotBusy ? "Resetting…" : "Reset Password"}
                </Btn>
              </>
            )}
          </div>
        )}

        <div className="mt-3 text-center">
          <button onClick={() => setPage("landing")} className="text-xs text-[var(--lm-text-faint)] hover:text-[var(--lm-text-muted)] flex items-center gap-1 mx-auto">
            <ChevronLeft size={12} /> Back to home
          </button>
        </div>
      </div>
    </AuthShell>
  );
}