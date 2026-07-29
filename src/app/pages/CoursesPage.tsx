import { useState, useEffect } from "react";
import { User, Search, Filter, Plus, X, Trash2 } from "lucide-react";
import { PRP } from "@/app/lib/constants";
import { Btn } from "@/app/components/shared";
import { listCourses, createCourse, listFields, createField, deleteCourse, ApiError, type CourseResponse, type FieldResponse } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { useGoTo } from "@/app/router/useGoTo";

// ─── Courses page ─────────────────────────────────────────────────────────────

export default function CoursesPage() {
  const { token, user } = useAuth();
  const goTo = useGoTo();
  const isLecturer = user?.role === "LECTURER";
  const [showForm, setShowForm] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [fields, setFields] = useState<FieldResponse[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState("");
  const [showNewFieldInput, setShowNewFieldInput] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [addingField, setAddingField] = useState(false);
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) return;
    listCourses(token)
      .then(setCourses)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load courses."))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    listFields(token).then(setFields).catch(() => {});
  }, [token]);

  const filtered = courses.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));
  async function handleCreate() {
    if (!token) return;
    if (!newCode.trim() || !newTitle.trim()) {
      setFormError("Both code and title are required.");
      return;
    }

    setFormError(null);
    setSaving(true);
    try {
      const created = await createCourse(newCode.trim(), newTitle.trim(), selectedFieldId || null, token);
      // Prepend so the new course appears immediately without a refetch
      setCourses((prev) => [created, ...prev]);
      setNewCode("");
      setNewTitle("");
      setSelectedFieldId("");
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not create course.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddField() {
    if (!token || !newFieldName.trim()) return;
    setAddingField(true);
    try {
      const field = await createField(newFieldName.trim(), token);
      setFields((prev) => {
        // Avoid a duplicate entry in the dropdown if the backend returned an
        // existing field (case-insensitive match) rather than a new one.
        if (prev.some((f) => f.id === field.id)) return prev;
        return [...prev, field].sort((a, b) => a.name.localeCompare(b.name));
      });
      setSelectedFieldId(field.id);
      setNewFieldName("");
      setShowNewFieldInput(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not add field.");
    } finally {
      setAddingField(false);
    }
  }

  async function handleDeleteCourse(courseId: string) {
    if (!token) return;
    if (!window.confirm("Delete this course? This permanently removes all its resources, quizzes, and announcements. This can't be undone.")) return;
    try {
      await deleteCourse(courseId, token);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete course.");
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--lm-text)]" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>My Courses</h2>
          <p className="text-sm text-[var(--lm-text-faint)]">{courses.length} courses</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--lm-text-faint)]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses…"
              className="bg-[var(--lm-card-bg)] border border-[rgba(109,40,217,0.12)] rounded-xl pl-8 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#7C3AED]/20 w-48 text-[var(--lm-text)]" />
          </div>
          <Btn variant="ghost" size="sm"><Filter size={13} /> Filter</Btn>
          {isLecturer && (
            <Btn variant="gradient" size="sm" onClick={() => setShowForm(!showForm)}>
              {showForm ? <X size={13} /> : <Plus size={13} />}
              {showForm ? "Cancel" : "New Course"}
            </Btn>
          )}
        </div>
      </div>

      {isLecturer && showForm && (
        <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] shadow-sm p-5 space-y-3">
          <h3 className="font-bold text-[var(--lm-text)]" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Create a course</h3>
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{formError}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="Course code (e.g. CS301)"
              className="bg-[var(--lm-card-bg)] border border-[rgba(109,40,217,0.15)] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#7C3AED]/25 text-[var(--lm-text)]"
            />
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Course title"
              className="md:col-span-2 bg-[var(--lm-card-bg)] border border-[rgba(109,40,217,0.15)] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#7C3AED]/25 text-[var(--lm-text)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--lm-text-muted)] mb-1.5">Field</label>
            {!showNewFieldInput ? (
              <div className="flex gap-2">
                <select
                  value={selectedFieldId}
                  onChange={(e) => setSelectedFieldId(e.target.value)}
                  className="flex-1 bg-[var(--lm-card-bg)] border border-[rgba(109,40,217,0.15)] rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#7C3AED]/25 text-[var(--lm-text)]"
                >
                  <option value="">No field (unassigned)</option>
                  {fields.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <Btn variant="outline" size="sm" onClick={() => setShowNewFieldInput(true)}>
                  <Plus size={12} /> New Field
                </Btn>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="e.g. Data Science"
                  className="flex-1 bg-[var(--lm-card-bg)] border border-[rgba(109,40,217,0.15)] rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#7C3AED]/25 text-[var(--lm-text)]"
                />
                <Btn variant="gradient" size="sm" onClick={handleAddField} disabled={addingField || !newFieldName.trim()}>
                  {addingField ? "Adding…" : "Add"}
                </Btn>
                <Btn variant="ghost" size="sm" onClick={() => { setShowNewFieldInput(false); setNewFieldName(""); }}>
                  <X size={12} />
                </Btn>
              </div>
            )}
          </div>

          <Btn variant="gradient" onClick={handleCreate} disabled={saving}>
            {saving ? "Creating…" : "Create Course"}
          </Btn>
        </div>
      )}
      {loading && <p className="text-sm text-[var(--lm-text-faint)]">Loading courses…</p>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <p className="text-sm text-[var(--lm-text-faint)]">No courses yet.</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((course) => (
          <div key={course.id} className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
            <div className="h-1.5 rounded-full mb-4" style={{ backgroundColor: PRP }} />
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-mono font-bold text-[var(--lm-text-faint)] mb-1">{course.code}</p>
                <h3 className="font-bold text-[var(--lm-text)] text-base leading-tight" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{course.title}</h3>
              </div>
            </div>
            <p className="text-xs text-[var(--lm-text-faint)] mb-4 flex items-center gap-1.5"><User size={11} />{course.lecturerName}</p>
            {course.departmentName && (
              <p className="text-xs text-[var(--lm-text-faint)] mb-4">{course.departmentName}</p>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-[rgba(109,40,217,0.06)]">
              {isLecturer && course.lecturerName === user?.fullName ? (
                <button
                  type="button"
                  onClick={() => handleDeleteCourse(course.id)}
                  className="p-1.5 rounded-lg hover:bg-[#FEF2F2] text-[var(--lm-text-muted)] hover:text-[#DC2626] transition-colors"
                  title="Delete course"
                >
                  <Trash2 size={14} />
                </button>
              ) : <div />}
              <Btn variant="outline" size="sm" onClick={() => goTo(`courses/${course.id}`)}>View</Btn>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-5 shadow-sm">
          <p className="text-xs text-[var(--lm-text-faint)] font-medium mb-2">Total Courses</p>
          <p className="text-3xl font-extrabold" style={{ color: PRP }}>{courses.length}</p>
        </div>
      </div>
    </div>
  );
}

