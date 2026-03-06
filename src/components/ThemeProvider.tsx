import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeMode = "dark" | "light";

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "dark",
  setMode: () => {},
  toggleMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("app-theme-mode");
    const m: ThemeMode = stored === "light" ? "light" : "dark";
    applyMode(m);
  }, []);

  const applyMode = (m: ThemeMode) => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(m);
    localStorage.setItem("app-theme-mode", m);
    setModeState(m);
  };

  const setMode = (m: ThemeMode) => applyMode(m);
  const toggleMode = () => applyMode(mode === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
