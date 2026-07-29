import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/app/context/AuthContext";

/**
 * Wraps a route tree. Requires a valid token — and optionally, one of a
 * specific set of roles. If `allowedRoles` is omitted, any logged-in user
 * passes (used for /app routes shared by everyone, like dashboard/profile).
 */
export function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    // Logged in, but wrong role for this specific route — send them
    // somewhere valid rather than showing a broken/forbidden page.
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Outlet />;
}