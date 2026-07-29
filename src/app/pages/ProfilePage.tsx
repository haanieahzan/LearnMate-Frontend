import { useState } from "react";
import { BookOpen, User, Plus, Calendar, GraduationCap, Lock, Mail, Building, Phone, CheckSquare } from "lucide-react";
import { PRP } from "@/app/lib/constants";
import { Btn, Badge, Field } from "@/app/components/shared";
import { useAuth } from "@/app/context/AuthContext";

// ─── Profile page ─────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user } = useAuth();
  const isStudent = user?.role === "STUDENT";
  const [tab, setTab] = useState("personal");
  return (
    <div className="p-6 space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-6 shadow-sm flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white text-3xl font-bold">{user?.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}</div>
          </div>
          <h2 className="font-extrabold text-[#1E1B4B] text-lg mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{user?.fullName}</h2>
          <p className="text-sm text-[#9CA3AF] mb-1">{user?.role}</p>
          <Badge color="green">{isStudent ? "Active Student" : "Active Lecturer"}</Badge>
          <div className="w-full border-t border-[rgba(109,40,217,0.08)] mt-5 pt-5 space-y-2.5">
            {(isStudent
              ? [["Student ID", "Not set"], ["Enrolled Since", "—"], ["Course", "—"]]
              : [["Department", "Not set"], ["Joined", "—"]]
            ).map(([l, v]) => (
              <div key={l} className="flex justify-between text-sm">
                <span className="text-[var(--lm-text-faint)]">{l}</span><span className="font-semibold text-[var(--lm-text)]">{v}</span>
              </div>
            ))}
          </div>
          <div className="w-full mt-4 grid grid-cols-3 gap-2 text-center">
            {[["14", "Day Streak"], ["34", "Quizzes"], ["23", "Docs"]].map(([n, l]) => (
              <div key={l} className="bg-[var(--lm-surface)] rounded-xl p-2.5">
                <p className="font-extrabold text-[var(--lm-text)] text-lg">{n}</p>
                <p className="text-[10px] text-[var(--lm-text-faint)]">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] shadow-sm">
          <div className="flex gap-0.5 border-b border-[var(--lm-border)] px-5">
            {[["personal", "Personal Info"], ["academic", "Academic Info"], ["preferences", "Preferences"], ["password", "Security"]].map(([id, lbl]) => (
              <button key={id} onClick={() => setTab(id)}
                className={`px-4 py-4 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === id ? "border-[#7C3AED] text-[#7C3AED]" : "border-transparent text-[var(--lm-text-faint)] hover:text-[var(--lm-text)]"}`}>
                {lbl}
              </button>
            ))}
          </div>
          <div className="p-6">
            {tab === "personal" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First Name" placeholder="Emma" icon={User} />
                  <Field label="Last Name" placeholder="Thompson" icon={User} />
                </div>
                <Field label="Email Address" type="email" placeholder="e.thompson@university.ac.uk" icon={Mail} />
                <Field label="Phone Number" type="tel" placeholder="+44 7700 900000" icon={Phone} />
                <div>
                  <label className="block text-sm font-semibold text-[var(--lm-text)] mb-1.5">Bio</label>
                  <textarea rows={3} placeholder="Tell us about your learning goals…"
                    className="w-full bg-[var(--lm-card-bg)] border border-[rgba(109,40,217,0.15)] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#7C3AED]/25 resize-none" />
                </div>
                <Btn variant="gradient">Save Changes</Btn>
              </div>
            )}
            {tab === "academic" && (
              <div className="space-y-4">
                <Field label="University" placeholder="University of Ruhuna" icon={Building} />
                {isStudent ? (
                  <>
                    <Field label="Student ID" placeholder="STU2024001" icon={CheckSquare} />
                    <Field label="Degree Programme" placeholder="BSc Computer Science" icon={GraduationCap} />
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Year of Study" placeholder="3" icon={BookOpen} />
                      <Field label="Expected Graduation" placeholder="May 2025" icon={Calendar} />
                    </div>
                  </>
                ) : (
                  <Field label="Department" placeholder="e.g. Computer Science" icon={Building} />
                )}
                <Btn variant="gradient">Save Changes</Btn>
              </div>
            )}
            {tab === "preferences" && (
              <div className="space-y-5">
                {[["Email Notifications", "Receive weekly study progress reports"], ["Study Reminders", "Daily reminders to hit your study goals"], ["AI Recommendations", "Get personalised content recommendations"], ["Quiz Challenges", "Auto-generate weekly quiz challenges"]].map(([l, d]) => (
                  <div key={l} className="flex items-center justify-between">
                    <div><p className="text-sm font-semibold text-[var(--lm-text)]">{l}</p><p className="text-xs text-[var(--lm-text-faint)]">{d}</p></div>
                    <div className="relative w-10 h-5 rounded-full cursor-pointer" style={{ backgroundColor: PRP }}>
                      <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[var(--lm-card-bg)] shadow-sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {tab === "password" && (
              <div className="space-y-4 max-w-sm">
                <Field label="Current Password" type="password" placeholder="Enter current password" icon={Lock} />
                <Field label="New Password" type="password" placeholder="Min. 8 characters" icon={Lock} />
                <Field label="Confirm Password" type="password" placeholder="Repeat new password" icon={Lock} />
                <Btn variant="gradient">Update Password</Btn>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

