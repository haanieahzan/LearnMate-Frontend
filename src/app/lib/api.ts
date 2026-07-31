// Small, dependency-free API client using the browser's built-in fetch.
// Base URL comes from a Vite env var so it's easy to point at your deployed
// backend later without changing code — see .env.local setup in the README.

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  role: "STUDENT" | "LECTURER" | "ADMIN";
}

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export interface CourseResponse {
  id: string;
  code: string;
  title: string;
  lecturerName: string;
  departmentName: string | null;
  createdAt: string;
}

async function get<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.message ?? "Something went wrong. Please try again.", res.status, data.code);
  }

  return data as T;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Backend's GlobalExceptionHandler returns { message: "..." } on errors
    throw new ApiError(data.message ?? "Something went wrong. Please try again.", res.status, data.code);
  }

  return data as T;
}

export function login(email: string, password: string) {
  return post<AuthResponse>("/api/auth/login", { email, password });
}

export function register(
  email: string,
  password: string,
  fullName: string,
  role: "STUDENT" | "LECTURER"
) {
  return post<AuthResponse>("/api/auth/register", { email, password, fullName, role });
}

export interface AdminUserResponse {
  id: string;
  email: string;
  fullName: string;
  role: "STUDENT" | "LECTURER" | "ADMIN";
  createdAt: string;
}

export function listAdminUsers(token: string) {
  return get<AdminUserResponse[]>("/api/admin/users", token);
}

export function updateUserRole(userId: string, role: AdminUserResponse["role"], token: string) {
  return patchAuth<AdminUserResponse>(`/api/admin/users/${userId}/role`, { role }, token);
}

export async function deleteUser(userId: string, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.message ?? "Could not delete user.", res.status);
  }
}

export interface AiConfigResponse {
  llm_provider: "gemini" | "ollama";
  ollama_model: string;
  available_ollama_models: string[];
}

export function getAiConfig(token: string) {
  return get<AiConfigResponse>("/api/admin/ai-config", token);
}

export function setAiProvider(provider: "gemini" | "ollama", token: string) {
  return postAuth<Partial<AiConfigResponse>>(
    `/api/admin/ai-config/provider?provider=${encodeURIComponent(provider)}`, {}, token);
}

export function setOllamaModel(model: string, token: string) {
  return postAuth<Partial<AiConfigResponse>>(
    `/api/admin/ai-config/model?model=${encodeURIComponent(model)}`, {}, token);
}

export function listCourses(token: string) {
  return get<CourseResponse[]>("/api/courses", token);
}

export function getCourse(courseId: string, token: string) {
  return get<CourseResponse>(`/api/courses/${courseId}`, token);
}

export interface AskResponse {
  question: string;
  answer: string;
  sources_used: number;
}

export interface QuizQuestionResponse {
  id: string;
  questionText: string;
  options: string[];
}

export interface QuizResponse {
  id: string;
  courseId: string;
  title: string;
  createdAt: string;
  questions: QuizQuestionResponse[];
}

export interface QuestionResult {
  questionId: string;
  questionText: string;
  selectedAnswer: string | null;
  correctAnswer: string;
  correct: boolean;
}

export interface QuizAttemptResponse {
  id: string;
  quizId: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  attemptedAt: string;
  breakdown: QuestionResult[];
}

export function listQuizzesByCourse(courseId: string, token: string) {
  return get<QuizResponse[]>(`/api/quizzes/course/${courseId}`, token);
}

export function generateQuiz(
  resourceId: string, numQuestions: number, difficulty: string, token: string,
  provider?: "gemini" | "ollama", ollamaModel?: string
) {
  return postAuth<QuizResponse>(
    "/api/quizzes/generate",
    { resourceId, numQuestions, difficulty, provider: provider ?? null, ollamaModel: ollamaModel ?? null },
    token
  );
}

export function submitQuizAttempt(quizId: string, answers: Record<string, string>, token: string) {
  return postAuth<QuizAttemptResponse>(`/api/quizzes/${quizId}/attempts`, { answers }, token);
}

export function askAi(
  question: string, token: string, resourceId?: string,
  provider?: "gemini" | "ollama", ollamaModel?: string
) {
  return postAuth<AskResponse>(
    "/api/ai/ask",
    { question, resourceId: resourceId ?? null, provider: provider ?? null, ollamaModel: ollamaModel ?? null },
    token
  );
}

export interface AnnouncementResponse {
  id: string;
  courseId: string;
  title: string;
  content: string;
  postedByName: string;
  createdAt: string;
}

export function listAnnouncements(courseId: string, token: string) {
  return get<AnnouncementResponse[]>(`/api/courses/${courseId}/announcements`, token);
}

export function createAnnouncement(courseId: string, title: string, content: string, token: string) {
  return postAuth<AnnouncementResponse>(`/api/courses/${courseId}/announcements`, { title, content }, token);
}

export async function deleteAnnouncement(courseId: string, announcementId: string, token: string): Promise<void> {
  const res = await fetch(
    `${API_URL}/api/courses/${courseId}/announcements/${announcementId}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.message ?? "Could not delete announcement.", res.status);
  }
}

export async function deleteResource(courseId: string, resourceId: string, token: string): Promise<void> {
  const res = await fetch(
    `${API_URL}/api/courses/${courseId}/resources/${resourceId}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.message ?? "Could not delete resource.", res.status, data.code);
  }
  // 204 No Content — nothing to return
}

export async function downloadResource(
  courseId: string,
  resourceId: string,
  filename: string,
  token: string
): Promise<void> {
  const res = await fetch(
    `${API_URL}/api/courses/${courseId}/resources/${resourceId}/download`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    throw new ApiError("Could not download file.", res.status);
  }

  // Turn the response into a downloadable blob and trigger a browser download
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url); // free the memory once done
}

async function postAuth<T>(path: string, body: unknown, token: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (!res.ok) {
    throw new ApiError(data.message ?? "Something went wrong. Please try again.", res.status, data.code);
  }
  }

  return data as T;
}

async function patchAuth<T>(path: string, body: unknown, token: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (!res.ok) {
    throw new ApiError(data.message ?? "Something went wrong. Please try again.", res.status, data.code);
  }
  }
  return data as T;
}

export function createCourse(code: string, title: string, fieldId: string | null, token: string) {
  return postAuth<CourseResponse>("/api/courses", { code, title, departmentId: null, fieldId }, token);
}

export interface LearningResourceResponse {
  id: string;
  courseId: string;
  title: string;
  fileType: string;
  uploadedByName: string;
  uploadedAt: string;
}

export function listResources(courseId: string, token: string) {
  return get<LearningResourceResponse[]>(`/api/courses/${courseId}/resources`, token);
}

export async function uploadResource(courseId: string, file: File, token: string) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/api/courses/${courseId}/resources`, {
    method: "POST",
    // NOTE: deliberately NOT setting Content-Type here. The browser must set it
    // itself so it can add the multipart boundary — setting it manually breaks
    // the upload.
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.message ?? "Upload failed.", res.status);
  }

  return data as LearningResourceResponse;
}

export interface SkillAreaScore {
  skillArea: string;
  courseCode: string;
  averageScore: number;
  attemptCount: number;
  resourceId: string | null;
}

export interface QuizAttemptSummary {
  skillArea: string;
  quizTitle: string;
  score: number;
  attemptedAt: string;
}

export interface FieldScore {
  fieldName: string;
  averageScore: number;
  skills: SkillAreaScore[];
}

export function getCurrentSkills(token: string) {
  return get<FieldScore[]>("/api/skills-assessments/current", token);
}

export function getSkillsHistory(token: string) {
  return get<QuizAttemptSummary[]>("/api/skills-assessments/history", token);
}

export interface FieldResponse {
  id: string;
  name: string;
}

export function listFields(token: string) {
  return get<FieldResponse[]>("/api/fields", token);
}

export function createField(name: string, token: string) {
  return postAuth<FieldResponse>("/api/fields", { name }, token);
}

export async function deleteCourse(courseId: string, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/courses/${courseId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.message ?? "Could not delete course.", res.status);
  }
}

export interface RecommendationResponse {
  type: "weak_skill" | "untaken_quiz" | "get_started";
  title: string;
  description: string;
  courseId: string | null;
  quizId: string | null;
  resourceId: string | null;
}

export function getRecommendations(token: string) {
  return get<RecommendationResponse[]>("/api/recommendations", token);
}

export interface StreakResponse {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

export function getStreak(token: string) {
  return get<StreakResponse>("/api/streaks", token);
}

export interface VideoResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  watchUrl: string;
}

export function searchVideos(query: string, token: string) {
  return get<VideoResult[]>(`/api/videos/search?query=${encodeURIComponent(query)}`, token);
}

export interface RecentAttemptSummary {
  quizTitle: string;
  score: number;
  attemptedAt: string;
}

export interface StudentAnalyticsResponse {
  totalCourses: number;
  quizzesTaken: number;
  averageScore: number;
  weakSkillCount: number;
  currentStreak: number;
  recentAttempts: RecentAttemptSummary[];
}

export function getStudentAnalytics(token: string) {
  return get<StudentAnalyticsResponse>("/api/analytics/student", token);
}

export interface AtRiskStudent {
  fullName: string;
  email: string;
  averageScore: number;
}

export interface CourseAnalytics {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  quizCount: number;
  totalAttempts: number;
  classAverage: number;
  atRiskStudents: AtRiskStudent[];
}

export interface LecturerAnalyticsResponse {
  totalCourses: number;
  totalStudents: number;
  courses: CourseAnalytics[];
}

export function getLecturerAnalytics(token: string) {
  return get<LecturerAnalyticsResponse>("/api/analytics/lecturer", token);
}

export interface FlashcardResponse {
  id: string;
  frontText: string;
  backText: string;
}

export function generateFlashcards(
  resourceId: string, numCards: number, token: string,
  provider?: string, ollamaModel?: string
) {
  return postAuth<FlashcardResponse[]>(
    "/api/flashcards/generate",
    { resourceId, numCards, provider: provider ?? null, ollamaModel: ollamaModel ?? null },
    token
  );
}

export function listFlashcards(resourceId: string, token: string) {
  return get<FlashcardResponse[]>(`/api/flashcards/resource/${resourceId}`, token);
}