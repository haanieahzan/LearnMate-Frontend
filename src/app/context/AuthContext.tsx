import { createContext, useContext, useState, type ReactNode } from "react";
import type { AuthResponse } from "@/app/lib/api";

interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
  role: "STUDENT" | "LECTURER" | "ADMIN";
}

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (res: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "learnmate_auth";

function loadFromStorage(): { token: string | null; user: AuthUser | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, user: null };
    const parsed = JSON.parse(raw);
    return { token: parsed.token ?? null, user: parsed.user ?? null };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = loadFromStorage();
  const [token, setToken] = useState<string | null>(initial.token);
  const [user, setUser] = useState<AuthUser | null>(initial.user);

  function setAuth(res: AuthResponse) {
    const nextUser: AuthUser = { userId: res.userId, email: res.email, fullName: res.fullName, role: res.role };
    setToken(res.token);
    setUser(nextUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: res.token, user: nextUser }));
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
