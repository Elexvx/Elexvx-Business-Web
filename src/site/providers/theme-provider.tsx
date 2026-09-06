'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ColorTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'elexvx-theme';

const getTimeTheme = (): ColorTheme => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
};

type ThemeContextValue = {
  theme: ColorTheme;
  setTheme: (theme: ColorTheme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const getDocumentTheme = (): ColorTheme => {
  if (typeof document !== 'undefined') {
    const documentTheme = document.documentElement.dataset.theme;
    if (documentTheme === 'light' || documentTheme === 'dark') return documentTheme;
  }

  return getTimeTheme();
};

const applyTheme = (theme: ColorTheme) => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ColorTheme>('dark');

  useEffect(() => {
    const initialTheme = getDocumentTheme();
    const readyFrame = window.requestAnimationFrame(() => document.documentElement.classList.add('theme-ready'));

    setThemeState(initialTheme);
    applyTheme(initialTheme);

    const applyAutomaticTheme = () => {
      try {
        if (window.localStorage.getItem(THEME_STORAGE_KEY)) return;
      } catch {
        return;
      }

      const nextTheme = getTimeTheme();
      setThemeState(nextTheme);
      applyTheme(nextTheme);
    };

    const handleStoredTheme = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      const nextTheme = event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : getTimeTheme();
      setThemeState(nextTheme);
      applyTheme(nextTheme);
    };

    const automaticThemeTimer = window.setInterval(applyAutomaticTheme, 60_000);
    window.addEventListener('storage', handleStoredTheme);

    return () => {
      window.cancelAnimationFrame(readyFrame);
      window.clearInterval(automaticThemeTimer);
      window.removeEventListener('storage', handleStoredTheme);
    };
  }, []);

  const setTheme = (nextTheme: ColorTheme) => {
    setThemeState(nextTheme);
    applyTheme(nextTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Theme switching should continue to work when storage is unavailable.
    }
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
