import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeName = "romantic-rose" | "nature-memory" | "ocean-dream" | "midnight-vintage";

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "romantic-rose",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const THEME_CLASSES: ThemeName[] = ["romantic-rose", "nature-memory", "ocean-dream", "midnight-vintage"];

const isThemeName = (value: string): value is ThemeName =>
  THEME_CLASSES.includes(value as ThemeName);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeName>("romantic-rose");

  useEffect(() => {
    const stored = localStorage.getItem("app-theme");
    if (stored && isThemeName(stored)) {
      applyTheme(stored);
    } else {
      applyTheme("romantic-rose");
    }
  }, []);

  const applyTheme = (t: ThemeName) => {
    const targets = [document.documentElement, document.body];

    targets.forEach((target) => {
      THEME_CLASSES.forEach((c) => target.classList.remove(`theme-${c}`));
      target.classList.add(`theme-${t}`);
    });

    localStorage.setItem("app-theme", t);
    setThemeState(t);
  };

  const setTheme = (t: ThemeName) => {
    applyTheme(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
