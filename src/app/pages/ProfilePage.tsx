import { useState, useEffect } from "react";
import { User as UserIcon, Mail, Phone, Building, CheckSquare, GraduationCap, BookOpen, Calendar, Lock } from "lucide-react";
import { Btn, Badge, Field } from "@/app/components/shared";
import { useAuth } from "@/app/context/AuthContext";
import { getProfile, updateProfile, changePassword, ApiError, type ProfileResponse } from "@/app/lib/api";

// ─── Profile page ─────────────────────────────────────────────────────────────
// Three tabs, all real: Personal Info, Academic Info (students only), Security.
// The old "Preferences" tab was removed — none of its toggles had any real
// feature behind them anywhere in the app.

export default function ProfilePage() {
  const { token, user } = useAuth();
  const isStudent = user?.role === "STUDENT";
  const [tab, setTab] = useState<"personal" | "academic" | "security">("personal");

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Personal Info form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [personalMsg, setPersonalMsg] = useState<string | null>(null);

  // Academic Info form state
  const [university, setUniversity] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [degreeProgramme, setDegreeProgramme] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [expectedGraduation, setExpectedGraduation] = useState("");
  const [savingAcademic, setSavingAcademic] = useState(false);
  const [academicMsg, setAcademicMsg] = useState<string | null>(null);

  // Security form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getProfile(token)
      .then((p) => {
        setProfile(p);
        const [f, ...rest] = p.fullName.split(" ");
        setFirstName(f ?? "");
        setLastName(rest.join(" "));
        setPhone(p.phone ?? "");
        setBio(p.bio ?? "");
        setUniversity(p.university ?? "");
        setStudentNumber(p.studentNumber ?? "");
        setDegreeProgramme(p.degreeProgramme ?? "");
        setYearOfStudy(p.yearOfStudy != null ? String(p.yearOfStudy) : "");
        setExpectedGraduation(p.expectedGraduation ?? "");
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function savePersonal() {
    if (!token) return;
    setSavingPersonal(true);
    setPersonalMsg(null);
    try {
      const updated = await updateProfile({ fullName: `${firstName} ${lastName}`.trim(), phone, bio }, token);
      setProfile(updated);
      setPersonalMsg("Saved.");
      setTimeout(() => setPersonalMsg(null), 2500);
    } catch (err) {
      setPersonalMsg(err instanceof ApiError ? err.message : "Could not save.");
    } finally {
      setSavingPersonal(false);
    }
  }

  async function saveAcademic() {
    if (!token) return;
    setSavingAcademic(true);
    setAcademicMsg(null);
    try {
      const updated = await updateProfile({
        university, studentNumber, degreeProgramme,
        yearOfStudy: yearOfStudy ? Number(yearOfStudy) : null,
        expectedGraduation,
      }, token);
      setProfile(updated);
      setAcademicMsg("Saved.");
      setTimeout(() => setAcademicMsg(null), 2500);
    } catch (err) {
      setAcademicMsg(err instanceof ApiError ? err.message : "Could not save.");
    } finally {
      setSavingAcademic(false);
    }
  }

  async function handleChangePassword() {
    if (!token) return;
    setPwError(null);
    setPwMsg(null);
    if (newPassword !== confirmPassword) {
      setPwError("New passwords don't match.");
      return;
    }
    setChangingPw(true);
    try {
      await changePassword(currentPassword, newPassword, token);
      setPwMsg("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwError(err instanceof ApiError ? err.message : "Could not change password.");
    } finally {
      setChangingPw(false);
    }
  }

  if (loading || !profile) {
    return <div className="p-6 text-sm text-[var(--lm-text-faint)]">Loading…</div>;
  }

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
      {/* Left summary card */}
      <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] shadow-sm p-6 flex flex-col items-center text-center h-fit">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white text-3xl font-bold mb-4">
          {profile.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <h2 className="font-extrabold text-[var(--lm-text)] text-lg mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{profile.fullName}</h2>
        <p className="text-sm text-[var(--lm-text-faint)] mb-3">{profile.role}</p>
        <Badge color="green">{isStudent ? "Active Student" : "Active Lecturer"}</Badge>

        {isStudent && (
          <div className="w-full border-t border-[var(--lm-border)] mt-5 pt-5 space-y-2.5 text-left">
            {[
              ["Student ID", profile.studentNumber || "Not set"],
              ["Programme", profile.degreeProgramme || "Not set"],
              ["Year", profile.yearOfStudy != null ? String(profile.yearOfStudy) : "Not set"],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between text-xs">
                <span className="text-[var(--lm-text-faint)]">{l}</span>
                <span className="font-semibold text-[var(--lm-text)]">{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: tabs */}
      <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] shadow-sm">
        <div className="flex border-b border-[var(--lm-border)] px-6">
          {[
            { id: "personal", label: "Personal Info" },
            ...(isStudent ? [{ id: "academic", label: "Academic Info" }] : []),
            { id: "security", label: "Security" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`px-4 py-4 text-sm font-semibold border-b-2 transition-colors ${tab === t.id ? "border-[#7C3AED] text-[#7C3AED]" : "border-transparent text-[var(--lm-text-faint)] hover:text-[var(--lm-text)]"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === "personal" && (
            <div className="space-y-4">
              {personalMsg && <div className="bg-[var(--lm-surface)] text-[var(--lm-text)] text-sm rounded-xl px-4 py-3">{personalMsg}</div>}
              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name" placeholder="First name" icon={UserIcon} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <Field label="Last Name" placeholder="Last name" icon={UserIcon} value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--lm-text)] mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--lm-text-faint)]" />
                  <input value={profile.email} disabled
                    className="w-full bg-[var(--lm-surface)] border border-[var(--lm-border)] rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--lm-text-faint)] cursor-not-allowed" />
                </div>
                <p className="text-[10px] text-[var(--lm-text-faint)] mt-1">Email can't be changed — it's tied to your account login.</p>
              </div>
              <Field label="Phone Number" placeholder="+94 7X XXX XXXX" icon={Phone} value={phone} onChange={(e) => setPhone(e.target.value)} />
              <div>
                <label className="block text-sm font-semibold text-[var(--lm-text)] mb-1.5">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Tell us about your learning goals…"
                  className="w-full bg-white border border-[rgba(109,40,217,0.15)] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#7C3AED]/25 text-[var(--lm-text)] resize-none" />
              </div>
              <Btn variant="gradient" onClick={savePersonal} disabled={savingPersonal}>
                {savingPersonal ? "Saving…" : "Save Changes"}
              </Btn>
            </div>
          )}

          {tab === "academic" && isStudent && (
            <div className="space-y-4">
              {academicMsg && <div className="bg-[var(--lm-surface)] text-[var(--lm-text)] text-sm rounded-xl px-4 py-3">{academicMsg}</div>}
              <Field label="University" placeholder="e.g. University of Ruhuna" icon={Building} value={university} onChange={(e) => setUniversity(e.target.value)} />
              <Field label="Student ID" placeholder="e.g. STU2024001" icon={CheckSquare} value={studentNumber} onChange={(e) => setStudentNumber(e.target.value)} />
              <Field label="Degree Programme" placeholder="e.g. BSc Computer Science" icon={GraduationCap} value={degreeProgramme} onChange={(e) => setDegreeProgramme(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Year of Study" placeholder="e.g. 3" icon={BookOpen} value={yearOfStudy} onChange={(e) => setYearOfStudy(e.target.value)} />
                <Field label="Expected Graduation" placeholder="e.g. May 2027" icon={Calendar} value={expectedGraduation} onChange={(e) => setExpectedGraduation(e.target.value)} />
              </div>
              <Btn variant="gradient" onClick={saveAcademic} disabled={savingAcademic}>
                {savingAcademic ? "Saving…" : "Save Changes"}
              </Btn>
            </div>
          )}

          {tab === "security" && (
            <div className="space-y-4 max-w-md">
              {pwMsg && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">{pwMsg}</div>}
              {pwError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{pwError}</div>}
              <Field label="Current Password" type="password" placeholder="Enter current password" icon={Lock} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              <Field label="New Password" type="password" placeholder="Min. 8 characters" icon={Lock} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <Field label="Confirm Password" type="password" placeholder="Repeat new password" icon={Lock} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              <Btn variant="gradient" onClick={handleChangePassword} disabled={changingPw}>
                {changingPw ? "Updating…" : "Update Password"}
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}