'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  DEFAULT_SUN_LOCATION,
  getBrowserMediaQuery,
  getGrantedSunLocation,
  getSolarTheme,
  getSystemTheme,
  isSunLocation,
  THEME_STORAGE_KEY,
  type ColorTheme,
  type SunLocation,
} from '../theme';

export type { ColorTheme } from '../theme';

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

  return getSystemTheme(getBrowserMediaQuery()) ?? getSolarTheme();
};

const readStoredTheme = (): ColorTheme | null => {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : null;
  } catch {
    return null;
  }
};

const applyTheme = (theme: ColorTheme) => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ColorTheme>('dark');
  const sunLocationRef = useRef<SunLocation>(DEFAULT_SUN_LOCATION);

  useEffect(() => {
    const initialTheme = getDocumentTheme();
    const systemMediaQuery = getBrowserMediaQuery();
    const readyFrame = window.requestAnimationFrame(() => document.documentElement.classList.add('theme-ready'));

    setThemeState(initialTheme);
    applyTheme(initialTheme);

    const applyAutomaticTheme = () => {
      if (readStoredTheme()) return;

      const nextTheme = getSystemTheme(systemMediaQuery) ?? getSolarTheme(new Date(), sunLocationRef.current);
      setThemeState(nextTheme);
      applyTheme(nextTheme);
    };

    const handleStoredTheme = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      const nextTheme =
        event.newValue === 'light' || event.newValue === 'dark'
          ? event.newValue
          : (getSystemTheme(systemMediaQuery) ?? getSolarTheme(new Date(), sunLocationRef.current));
      setThemeState(nextTheme);
      applyTheme(nextTheme);
    };

    const handleSystemThemeChange = () => applyAutomaticTheme();
    if (systemMediaQuery) {
      if (systemMediaQuery.addEventListener) {
        systemMediaQuery.addEventListener('change', handleSystemThemeChange);
      } else {
        systemMediaQuery.addListener?.(handleSystemThemeChange);
      }
    }

    if (!systemMediaQuery) {
      void getGrantedSunLocation().then((location) => {
        if (!isSunLocation(location) || readStoredTheme()) return;
        sunLocationRef.current = location;
        applyAutomaticTheme();
      });
    }

    const automaticThemeTimer = window.setInterval(applyAutomaticTheme, 60_000);
    window.addEventListener('storage', handleStoredTheme);

    return () => {
      window.cancelAnimationFrame(readyFrame);
      window.clearInterval(automaticThemeTimer);
      window.removeEventListener('storage', handleStoredTheme);
      if (systemMediaQuery?.removeEventListener) {
        systemMediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        systemMediaQuery?.removeListener?.(handleSystemThemeChange);
      }
    };
  }, [sunLocationRef]);

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
