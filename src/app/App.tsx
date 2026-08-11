import { BrowserRouter, Routes, Route } from "react-router";
import { AppStateProvider } from "@/app/context/AppStateContext";
import { AuthProvider } from "@/app/context/AuthContext";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import { useGoTo } from "@/app/router/useGoTo";

import LandingPage from "@/app/pages/LandingPage";
import LoginPage from "@/app/pages/LoginPage";
import RegisterPage from "@/app/pages/RegisterPage";
import DashboardPage from "@/app/pages/DashboardPage";
import CoursesPage from "@/app/pages/CoursesPage";
import CourseDetailPage from "@/app/pages/CourseDetailPage";
import ResourcesPage from "@/app/pages/ResourcesPage";
import AITutorPage from "@/app/pages/AITutorPage";
import AIRecommendationsPage from "@/app/pages/AIRecommendationsPage";
import ProgressPage from "@/app/pages/ProgressPage";
import StudyPlanPage from "@/app/pages/StudyPlanPage";
import SkillsPage from "@/app/pages/SkillsPage";
import QuizPage from "@/app/pages/QuizPage";
import ProfilePage from "@/app/pages/ProfilePage";
import LecturerPage from "@/app/pages/LecturerPage";
import AdminPage from "@/app/pages/AdminPage";

// The original prototype's Landing/Login/Register/Dashboard pages accept a
// setPage(pageName) callback prop. These tiny wrappers bridge that existing
// prop contract onto real navigation, so none of those page files needed to
// be rewritten internally.
function LandingRoute() {
  const goTo = useGoTo();
  return <LandingPage setPage={goTo} />;
}
function LoginRoute() {
  const goTo = useGoTo();
  return <LoginPage setPage={goTo} />;
}
function RegisterRoute() {
  const goTo = useGoTo();
  return <RegisterPage setPage={goTo} />;
}
function DashboardRoute() {
  const goTo = useGoTo();
  return <DashboardPage setPage={goTo} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppStateProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingRoute />} />
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/register" element={<RegisterRoute />} />

            {/* Everything under /app requires a valid token */}
            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<DashboardLayout />}>
                {/* Shared by every logged-in role */}
                <Route path="dashboard" element={<DashboardRoute />} />
                <Route path="courses" element={<CoursesPage />} />
                <Route path="courses/:courseId" element={<CourseDetailPage />} />
                <Route path="resources" element={<ResourcesPage />} />
                <Route path="ai-tutor" element={<AITutorPage />} />
                <Route path="ai-recommendations" element={<AIRecommendationsPage />} />
                <Route path="progress" element={<ProgressPage />} />
                <Route path="skills" element={<SkillsPage />} />
                <Route path="quiz" element={<QuizPage />} />
                <Route path="profile" element={<ProfilePage />} />

                {/* Role-restricted */}
                <Route element={<ProtectedRoute allowedRoles={["LECTURER"]} />}>
                  <Route path="lecturer" element={<LecturerPage />} />
                </Route>
                <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                  <Route path="admin" element={<AdminPage />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </AppStateProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
