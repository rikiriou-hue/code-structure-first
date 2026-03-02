import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeName = "romantic-rose" | "nature-memory" | "ocean-dream" | "midnight-vintage";
export type ThemeMode = "dark" | "light";

interface ThemeContextType {
  theme: ThemeName;
  mode: ThemeMode;
  setTheme: (t: ThemeName) => void;
  setMode: (m: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "romantic-rose",
  mode: "dark",
  setTheme: () => {},
  setMode: () => {},
  toggleMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const THEME_CLASSES: ThemeName[] = ["romantic-rose", "nature-memory", "ocean-dream", "midnight-vintage"];
const MODE_CLASSES: ThemeMode[] = ["dark", "light"];

const isThemeName = (value: string): value is ThemeName =>
  THEME_CLASSES.includes(value as ThemeName);

const isThemeMode = (value: string): value is ThemeMode =>
  MODE_CLASSES.includes(value as ThemeMode);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeName>("romantic-rose");
  const [mode, setModeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    const storedTheme = localStorage.getItem("app-theme");
    const storedMode = localStorage.getItem("app-theme-mode");

    const t = storedTheme && isThemeName(storedTheme) ? storedTheme : "romantic-rose";
    const m = storedMode && isThemeMode(storedMode) ? storedMode : "dark";

    applyTheme(t, m);
  }, []);

  const applyTheme = (t: ThemeName, m: ThemeMode) => {
    const targets = [document.documentElement, document.body];

    targets.forEach((target) => {
      THEME_CLASSES.forEach((c) => target.classList.remove(`theme-${c}`));
      MODE_CLASSES.forEach((c) => target.classList.remove(`mode-${c}`));
      target.classList.add(`theme-${t}`);
      target.classList.add(`mode-${m}`);
    });

    localStorage.setItem("app-theme", t);
    localStorage.setItem("app-theme-mode", m);
    setThemeState(t);
    setModeState(m);
  };

  const setTheme = (t: ThemeName) => applyTheme(t, mode);
  const setMode = (m: ThemeMode) => applyTheme(theme, m);
  const toggleMode = () => applyTheme(theme, mode === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
