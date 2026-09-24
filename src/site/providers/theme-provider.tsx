'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  DEFAULT_SUN_LOCATION,
  getGrantedSunLocation,
  getSolarTheme,
  isSunLocation,
  THEME_STORAGE_KEY,
  type ColorTheme,
  type SunLocation,
} from '../theme';

export type { ColorTheme } from '../theme';
export type ThemeMode = 'auto' | ColorTheme;

type ThemeContextValue = {
  theme: ColorTheme;
  mode: ThemeMode;
  setTheme: (theme: ColorTheme) => void;
  setAutomaticTheme: () => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const readStoredThemeMode = (): ThemeMode | null => {
  try {
    const storedMode = window.localStorage.getItem(THEME_STORAGE_KEY);
    return storedMode === 'auto' || storedMode === 'light' || storedMode === 'dark' ? storedMode : null;
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
  const [mode, setModeState] = useState<ThemeMode>('auto');
  const modeRef = useRef<ThemeMode>('auto');
  const sunLocationRef = useRef<SunLocation>(DEFAULT_SUN_LOCATION);

  useEffect(() => {
    const readyFrame = window.requestAnimationFrame(() => document.documentElement.classList.add('theme-ready'));

    const applyMode = (nextMode: ThemeMode) => {
      modeRef.current = nextMode;
      setModeState(nextMode);
      const nextTheme = nextMode === 'auto' ? getSolarTheme(new Date(), sunLocationRef.current) : nextMode;
      setThemeState(nextTheme);
      applyTheme(nextTheme);
    };

    applyMode(readStoredThemeMode() ?? 'auto');

    const applyAutomaticTheme = () => {
      if (modeRef.current !== 'auto') return;
      const nextTheme = getSolarTheme(new Date(), sunLocationRef.current);
      setThemeState(nextTheme);
      applyTheme(nextTheme);
    };

    const handleStoredTheme = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      const nextMode =
        event.newValue === 'light' || event.newValue === 'dark' || event.newValue === 'auto'
          ? event.newValue
          : 'auto';
      applyMode(nextMode);
    };

    void getGrantedSunLocation().then((location) => {
      if (!isSunLocation(location) || modeRef.current !== 'auto') return;
      sunLocationRef.current = location;
      applyAutomaticTheme();
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') applyAutomaticTheme();
    };

    const automaticThemeTimer = window.setInterval(applyAutomaticTheme, 60_000);
    window.addEventListener('storage', handleStoredTheme);
    window.addEventListener('focus', applyAutomaticTheme);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.cancelAnimationFrame(readyFrame);
      window.clearInterval(automaticThemeTimer);
      window.removeEventListener('storage', handleStoredTheme);
      window.removeEventListener('focus', applyAutomaticTheme);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const setMode = (nextMode: ThemeMode) => {
    modeRef.current = nextMode;
    setModeState(nextMode);
    const nextTheme = nextMode === 'auto' ? getSolarTheme(new Date(), sunLocationRef.current) : nextMode;
    setThemeState(nextTheme);
    applyTheme(nextTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextMode);
    } catch {
      // Theme switching should continue to work when storage is unavailable.
    }
  };

  const setTheme = (nextTheme: ColorTheme) => setMode(nextTheme);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      mode,
      setTheme,
      setAutomaticTheme: () => setMode('auto'),
      toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    }),
    [theme, mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
