import { useLayoutEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  applyTheme,
  getStoredTheme,
  getSystemTheme,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from '../lib/theme';
import { ThemeToggle } from './ThemeToggle';

export const AppShell = () => {
  const [theme, setTheme] = useState<ThemePreference>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }

    return getStoredTheme() ?? getSystemTheme();
  });

  useLayoutEffect(() => {
    const storedTheme = getStoredTheme();
    applyTheme(storedTheme);
    setTheme(resolveThemeForUI(storedTheme));

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const nextStoredTheme = getStoredTheme();
      if (nextStoredTheme !== null) {
        return;
      }

      const nextSystemTheme = getSystemTheme();
      applyTheme(null);
      setTheme(nextSystemTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleThemeChange = (nextTheme: ThemePreference) => {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
    setTheme(nextTheme);
  };

  return (
    <div className="min-h-screen px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:gap-6">
        <header className="flex items-center justify-between gap-3 px-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-[var(--accent)] sm:text-xs">
            Basketball Stats
          </p>
          <ThemeToggle theme={theme} onChange={handleThemeChange} />
        </header>
        <main className="pt-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const resolveThemeForUI = (storedTheme: ThemePreference | null): ThemePreference =>
  storedTheme ?? getSystemTheme();
