import { useState, useEffect } from "react";
import { Target, HelpCircle, Sparkles, ArrowRight, AlertCircle, Youtube } from "lucide-react";
import { PRP, IND } from "@/app/lib/constants";
import { useAuth } from "@/app/context/AuthContext";
import { useGoTo } from "@/app/router/useGoTo";
import { getRecommendations, searchVideos, ApiError, type RecommendationResponse, type VideoResult } from "@/app/lib/api";


// ─── AI Recommendations page ──────────────────────────────────────────────────
// Rules-based, computed from real quiz performance — no fabricated stats.
// See RecommendationService.java for the actual logic (weak skills, untaken
// quizzes, and a first-time nudge).

const TYPE_META: Record<RecommendationResponse["type"], { icon: typeof Target; badge: string; badgeColor: string; cta: string }> = {
  weak_skill:    { icon: Target,      badge: "Needs Focus",  badgeColor: "#DC2626", cta: "Retake Quiz" },
  untaken_quiz:  { icon: HelpCircle,  badge: "Try This",     badgeColor: "#4F46E5", cta: "Take Quiz" },
  get_started:   { icon: Sparkles,    badge: "Get Started",  badgeColor: PRP,       cta: "Go to Quiz Center" },
};

export default function AIRecommendationsPage() {
  const { token, user } = useAuth();
  const goTo = useGoTo();
  const [recommendations, setRecommendations] = useState<RecommendationResponse[]>([]);
  const [videosByIndex, setVideosByIndex] = useState<Record<number, VideoResult[]>>({});
  const [loadingVideosIndex, setLoadingVideosIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getRecommendations(token)
      .then(setRecommendations)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load recommendations."))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className="p-6 text-sm text-[var(--lm-text-faint)]">Loading…</div>;
  }

  async function handleFindVideos(index: number, searchTerm: string) {
    if (!token || videosByIndex[index]) return; // already fetched, don't re-search
    setLoadingVideosIndex(index);
    try {
      const videos = await searchVideos(searchTerm, token);
      setVideosByIndex((prev) => ({ ...prev, [index]: videos }));
    } catch {
      setVideosByIndex((prev) => ({ ...prev, [index]: [] }));
    } finally {
      setLoadingVideosIndex(null);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="relative rounded-[20px] overflow-hidden p-7 shadow-lg"
        style={{ background: "linear-gradient(135deg,#1E1B4B 0%,#312E81 30%,#4F46E5 65%,#7C3AED 100%)" }}>
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1 mb-4">
            <Sparkles size={12} className="text-yellow-300" />
            <span className="text-xs font-semibold text-white/90">Personalised for you</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Hi {user?.fullName?.split(" ")[0] ?? "there"} 👋
          </h2>
          <p className="text-indigo-200 text-sm max-w-md leading-relaxed">
            {recommendations.length === 0
              ? "You're all caught up — no specific recommendations right now."
              : `${recommendations.length} suggestion${recommendations.length !== 1 ? "s" : ""} based on your real quiz performance, below.`}
          </p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

      {recommendations.length === 0 && !error && (
        <div className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] p-8 text-center shadow-sm">
          <p className="text-sm text-[var(--lm-text-faint)]">
            Nothing to recommend right now. Take a few quizzes and check back — recommendations update automatically based on real performance.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {recommendations.map((rec, i) => {
          const meta = TYPE_META[rec.type];
          const Icon = meta.icon;
          return (
            <div key={i} className="bg-[var(--lm-card-bg)] rounded-2xl border border-[var(--lm-border)] shadow-sm p-5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: meta.badgeColor + "15" }}>
                <Icon size={20} style={{ color: meta.badgeColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: meta.badgeColor + "15", color: meta.badgeColor }}>
                    {meta.badge}
                  </span>
                </div>
                <h3 className="font-bold text-[var(--lm-text)] text-sm mb-1" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{rec.title}</h3>
                <p className="text-xs text-[var(--lm-text-faint)] leading-relaxed mb-3">{rec.description}</p>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <button
                    onClick={() => goTo("quiz")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: meta.badgeColor }}
                  >
                    {meta.cta} <ArrowRight size={12} />
                  </button>
                  {rec.type === "weak_skill" && (
                    <button
                      onClick={() => handleFindVideos(i, rec.title.replace(/^Review:\s*/, ""))}
                      disabled={loadingVideosIndex === i}
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <Youtube size={12} /> {loadingVideosIndex === i ? "Searching…" : "Find Videos"}
                    </button>
                  )}
                </div>

                {videosByIndex[i] && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {videosByIndex[i].length === 0 && (
                      <p className="text-[11px] text-[var(--lm-text-faint)] col-span-3">No videos found.</p>
                    )}
                    {videosByIndex[i].map((v) => (
                      <a key={v.videoId} href={v.watchUrl} target="_blank" rel="noopener noreferrer"
                        className="block rounded-xl overflow-hidden border border-[var(--lm-border)] hover:shadow-md transition-shadow">
                        <img src={v.thumbnailUrl} alt={v.title} className="w-full h-20 object-cover" />
                        <div className="p-2">
                          <p className="text-[10px] font-semibold text-[var(--lm-text)] line-clamp-2 leading-tight">{v.title}</p>
                          <p className="text-[9px] text-[var(--lm-text-faint)] mt-0.5">{v.channelTitle}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#FAF8FF] border border-[var(--lm-border)] rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle size={15} className="text-[var(--lm-text-faint)] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--lm-text-faint)] leading-relaxed">
          These recommendations are generated by simple, transparent rules based on your real quiz scores — not a black-box model. See your full breakdown on the Skills page.
        </p>
      </div>
    </div>
  );
}