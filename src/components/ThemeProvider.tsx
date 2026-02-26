import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

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
    applyTheme("romantic-rose");

    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from("profiles")
        .select("theme")
        .eq("user_id", session.user.id)
        .single();
      if (data?.theme && isThemeName(data.theme)) {
        applyTheme(data.theme);
      }
    };
    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data } = await supabase
          .from("profiles")
          .select("theme")
          .eq("user_id", session.user.id)
          .single();
        if (data?.theme && isThemeName(data.theme)) {
          applyTheme(data.theme);
          return;
        }
      }

      applyTheme("romantic-rose");
    });

    return () => subscription.unsubscribe();
  }, []);

  const applyTheme = (t: ThemeName) => {
    const targets = [document.documentElement, document.body];

    targets.forEach((target) => {
      THEME_CLASSES.forEach((c) => target.classList.remove(`theme-${c}`));
      target.classList.add(`theme-${t}`);
    });

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