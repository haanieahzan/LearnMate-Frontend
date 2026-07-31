import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import { ChevronLeft, File, User, Download, Trash2, Megaphone, Plus, X, Youtube, Layers } from "lucide-react";
import { PRP } from "@/app/lib/constants";
import { Btn, TypeBadge } from "@/app/components/shared";
import { useGoTo } from "@/app/router/useGoTo";
import { useAuth } from "@/app/context/AuthContext";
import {
  getCourse, listResources, uploadResource, downloadResource, deleteResource,
  listAnnouncements, createAnnouncement, deleteAnnouncement, searchVideos,
  generateFlashcards, listFlashcards, ApiError,
  type CourseResponse, type LearningResourceResponse, type AnnouncementResponse,
  type VideoResult, type FlashcardResponse,
} from "@/app/lib/api";
import { FlashcardStudy } from "@/app/components/shared/FlashcardStudy";

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { token, user } = useAuth();
  const goTo = useGoTo();
  const isLecturer = user?.role === "LECTURER";

  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [resources, setResources] = useState<LearningResourceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [postingAnn, setPostingAnn] = useState(false);
  const [videos, setVideos] = useState<VideoResult[] | null>(null);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [expandedFlashcards, setExpandedFlashcards] = useState<string | null>(null);
  const [flashcardsByResource, setFlashcardsByResource] = useState<Record<string, FlashcardResponse[]>>({});
  const [flashcardBusy, setFlashcardBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !courseId) return;
    setLoading(true);
    Promise.all([
      getCourse(courseId, token),
      listResources(courseId, token),
      listAnnouncements(courseId, token),
    ])
      .then(([c, r, a]) => { setCourse(c); setResources(r); setAnnouncements(a); })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load course."))
      .finally(() => setLoading(false));
  }, [token, courseId]);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token || !courseId) return;
    setUploading(true);
    setError(null);
    try {
      const created = await uploadResource(courseId, file, token);
      setResources((prev) => [created, ...prev]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(resourceId: string) {
    if (!token || !courseId) return;
    if (!window.confirm("Delete this resource? This can't be undone.")) return;

    setError(null);
    try {
      await deleteResource(courseId, resourceId, token);
      setResources((prev) => prev.filter((r) => r.id !== resourceId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed.");
    }
  }

  async function handleFindVideos() {
    if (!token || !course || videos) return; // already fetched — don't re-search
    setLoadingVideos(true);
    try {
      const results = await searchVideos(course.title, token);
      setVideos(results);
    } catch {
      setVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  }

  async function handlePostAnnouncement() {
    if (!token || !courseId) return;
    if (!annTitle.trim() || !annContent.trim()) {
      setError("Announcement needs both a title and content.");
      return;
    }
    setPostingAnn(true);
    setError(null);
    try {
      const created = await createAnnouncement(courseId, annTitle.trim(), annContent.trim(), token);
      setAnnouncements((prev) => [created, ...prev]);
      setAnnTitle("");
      setAnnContent("");
      setShowAnnForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not post announcement.");
    } finally {
      setPostingAnn(false);
    }
  }

  async function handleDeleteAnnouncement(id: string) {
    if (!token || !courseId) return;
    if (!window.confirm("Delete this announcement?")) return;
    setError(null);
    try {
      await deleteAnnouncement(courseId, id, token);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed.");
    }
  }

  async function toggleFlashcards(resourceId: string) {
    if (expandedFlashcards === resourceId) {
      setExpandedFlashcards(null);
      return;
    }
    setExpandedFlashcards(resourceId);

    if (!flashcardsByResource[resourceId] && token) {
      setFlashcardBusy(resourceId);
      try {
        const cards = await listFlashcards(resourceId, token);
        setFlashcardsByResource((prev) => ({ ...prev, [resourceId]: cards }));
      } catch {
        setFlashcardsByResource((prev) => ({ ...prev, [resourceId]: [] }));
      } finally {
        setFlashcardBusy(null);
      }
    }
  }

  async function handleGenerateFlashcards(resourceId: string) {
    if (!token) return;
    setFlashcardBusy(resourceId);
    setError(null);
    try {
      const cards = await generateFlashcards(resourceId, 10, token);
      setFlashcardsByResource((prev) => ({ ...prev, [resourceId]: cards }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not generate flashcards.");
    } finally {
      setFlashcardBusy(null);
    }
  }

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <button onClick={() => goTo("courses")} className="text-xs text-[var(--lm-text-faint)] hover:text-[var(--lm-text)] flex items-center gap-1">
        <ChevronLeft size={13} /> Back to courses
      </button>

      {loading && <p className="text-sm text-[var(--lm-text-faint)]">Loading…</p>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

      {course && (
        <>
          <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] shadow-sm p-6">
            <div className="h-1.5 rounded-full mb-4 w-16" style={{ backgroundColor: PRP }} />
            <p className="text-xs font-mono font-bold text-[var(--lm-text-faint)] mb-1">{course.code}</p>
            <h1 className="text-xl font-extrabold text-[var(--lm-text)] mb-2" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{course.title}</h1>
            <p className="text-xs text-[var(--lm-text-faint)] flex items-center gap-1.5 mb-4"><User size={12} />{course.lecturerName}</p>

            {!videos && (
              <button
                onClick={handleFindVideos}
                disabled={loadingVideos}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <Youtube size={13} /> {loadingVideos ? "Searching…" : "Find related videos"}
              </button>
            )}

            {videos && (
              <div>
                <p className="text-[10px] font-bold text-[var(--lm-text-faint)] uppercase tracking-wider mb-2">Related Videos</p>
                {videos.length === 0 ? (
                  <p className="text-xs text-[var(--lm-text-faint)]">No videos found.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {videos.map((v) => (
                      <a key={v.videoId} href={v.watchUrl} target="_blank" rel="noopener noreferrer"
                        className="block rounded-xl overflow-hidden border border-[var(--lm-border)] hover:shadow-md transition-shadow">
                        <img src={v.thumbnailUrl} alt={v.title} className="w-full h-24 object-cover" />
                        <div className="p-2">
                          <p className="text-[10px] font-semibold text-[var(--lm-text)] line-clamp-2 leading-tight">{v.title}</p>
                          <p className="text-[9px] text-[var(--lm-text-faint)] mt-0.5">{v.channelTitle}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[var(--lm-text)] flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                <Megaphone size={16} /> Announcements
              </h2>
              {isLecturer && (
                <Btn variant="gradient" size="sm" onClick={() => setShowAnnForm(!showAnnForm)}>
                  {showAnnForm ? <X size={12} /> : <Plus size={12} />}
                  {showAnnForm ? "Cancel" : "Post"}
                </Btn>
              )}
            </div>

            {isLecturer && showAnnForm && (
              <div className="mb-4 space-y-2.5 pb-4 border-b border-[var(--lm-border)]">
                <input
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Announcement title"
                  className="w-full bg-[var(--lm-card-bg)] border border-[rgba(109,40,217,0.15)] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#7C3AED]/25 text-[var(--lm-text)]"
                />
                <textarea
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Write your announcement…"
                  rows={3}
                  className="w-full bg-[var(--lm-card-bg)] border border-[rgba(109,40,217,0.15)] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#7C3AED]/25 text-[var(--lm-text)] resize-none"
                />
                <Btn variant="gradient" size="sm" onClick={handlePostAnnouncement} disabled={postingAnn}>
                  {postingAnn ? "Posting…" : "Post Announcement"}
                </Btn>
              </div>
            )}

            {announcements.length === 0 && (
              <p className="text-sm text-[var(--lm-text-faint)]">No announcements yet.</p>
            )}
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="border border-[var(--lm-border)] rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-[var(--lm-text)]">{ann.title}</h3>
                    {isLecturer && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="p-1 rounded-lg hover:bg-[#FEF2F2] text-[var(--lm-text-muted)] hover:text-[#DC2626] transition-colors flex-shrink-0"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-[var(--lm-text-muted)] mt-1 whitespace-pre-wrap">{ann.content}</p>
                  <p className="text-[10px] text-[var(--lm-text-faint)] mt-2">
                    {ann.postedByName} · {new Date(ann.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[var(--lm-text)]" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Resources</h2>
              {isLecturer && (
                <>
                  <input ref={fileInputRef} type="file" onChange={handleFileSelected} className="hidden" />
                  <Btn variant="gradient" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    <File size={12} /> {uploading ? "Uploading…" : "Upload"}
                  </Btn>
                </>
              )}
            </div>

            {resources.length === 0 && (
              <p className="text-sm text-[var(--lm-text-faint)]">No resources uploaded yet.</p>
            )}
            <div className="space-y-1.5">
              {resources.map((res) => (
                <div key={res.id}>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--lm-surface)] transition-colors">
                    <File size={14} className="text-[var(--lm-text-faint)] flex-shrink-0" />
                    <span className="text-sm text-[var(--lm-text)] flex-1 truncate">{res.title}</span>
                    <TypeBadge type={res.fileType} />
                    <span className="text-[10px] text-[var(--lm-text-faint)]">{res.uploadedByName}</span>
                    <button
                      type="button"
                      onClick={() => toggleFlashcards(res.id)}
                      className={`p-1.5 rounded-lg hover:bg-[var(--lm-card-bg)] transition-colors flex-shrink-0 ${expandedFlashcards === res.id ? "text-[#7C3AED]" : "text-[var(--lm-text-muted)] hover:text-[#7C3AED]"}`}
                      title="Flashcards"
                    >
                      <Layers size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (token && courseId) {
                          downloadResource(courseId, res.id, res.title, token)
                            .catch((err) => setError(err instanceof ApiError ? err.message : "Download failed."));
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-[var(--lm-card-bg)] text-[var(--lm-text-muted)] hover:text-[#7C3AED] transition-colors flex-shrink-0"
                      title="Download"
                    >
                      <Download size={14} />
                    </button>
                    {isLecturer && (
                      <button
                        type="button"
                        onClick={() => handleDelete(res.id)}
                        className="p-1.5 rounded-lg hover:bg-[#FEF2F2] text-[var(--lm-text-muted)] hover:text-[#DC2626] transition-colors flex-shrink-0"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {expandedFlashcards === res.id && (
                    <div className="ml-9 mr-3 mb-3 p-4 bg-[var(--lm-surface)] rounded-xl">
                      {flashcardBusy === res.id && (
                        <p className="text-xs text-[var(--lm-text-faint)] text-center py-4">Loading…</p>
                      )}
                      {flashcardBusy !== res.id && (flashcardsByResource[res.id]?.length ?? 0) === 0 && (
                        <div className="text-center py-4">
                          <p className="text-xs text-[var(--lm-text-faint)] mb-3">No flashcards yet for this resource.</p>
                          {flashcardBusy !== res.id && (flashcardsByResource[res.id]?.length ?? 0) === 0 && (
                        <div className="text-center py-4">
                          <p className="text-xs text-[var(--lm-text-faint)] mb-3">No flashcards yet for this resource.</p>
                          <Btn variant="gradient" size="sm" onClick={() => handleGenerateFlashcards(res.id)}>
                            <Plus size={12} /> Generate Flashcards
                          </Btn>
                        </div>
                      )}
                        </div>
                      )}
                      {flashcardBusy !== res.id && (flashcardsByResource[res.id]?.length ?? 0) > 0 && (
                        <FlashcardStudy cards={flashcardsByResource[res.id]} />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}