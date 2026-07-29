import { createContext, useContext, useState, type ReactNode } from "react";

interface AppStateValue {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  return (
    <AppStateContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within <AppStateProvider>");
  return ctx;
}