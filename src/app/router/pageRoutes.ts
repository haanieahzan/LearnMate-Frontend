// Central map between the app's internal "page name" concept (used throughout
// the original prototype's setPage("dashboard") calls) and real URL paths.
// This lets every existing page component keep working unmodified — they still
// call setPage("someName"), it just now navigates a real route under the hood.

export const ROUTES: Record<string, string> = {
  landing: "/",
  login: "/login",
  register: "/register",
  dashboard: "/app/dashboard",
  courses: "/app/courses",
  resources: "/app/resources",
  "ai-tutor": "/app/ai-tutor",
  "ai-recommendations": "/app/ai-recommendations",
  progress: "/app/progress",
  skills: "/app/skills",
  quiz: "/app/quiz",
  profile: "/app/profile",
  lecturer: "/app/lecturer",
  admin: "/app/admin",
};

export function pathToPage(pathname: string): string {
  // Exact match first (covers every normal page)
  const exact = Object.entries(ROUTES).find(([, path]) => path === pathname);
  if (exact) return exact[0];

  // No exact match — check if this is a sub-route of a known page
  // (e.g. /app/courses/<id> should still highlight "courses" in the sidebar).
  const prefixMatch = Object.entries(ROUTES).find(
    ([, path]) => path !== "/" && pathname.startsWith(path + "/")
  );
  if (prefixMatch) return prefixMatch[0];

  return "dashboard";
}