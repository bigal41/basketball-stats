import { useLayoutEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
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
        <header className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-[var(--accent)] sm:text-xs">
              Basketball Stats
            </p>
            <nav className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--panel-soft)] p-1 shadow-sm backdrop-blur">
              <HeaderNavLink to="/">Dashboard</HeaderNavLink>
              <HeaderNavLink to="/standings">Standings</HeaderNavLink>
            </nav>
          </div>
          <ThemeToggle theme={theme} onChange={handleThemeChange} />
        </header>
        <main className="pt-1">
          <Outlet />
        </main>
        <footer className="flex flex-col gap-2 px-1 pb-2 pt-2 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>Ballers United stats dashboard</span>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/bigal41/basketball-stats"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-[var(--accent)]"
            >
              GitHub
            </a>
            <a
              href="https://ralexclark.ca/"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-[var(--accent)]"
            >
              ralexclark.ca
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

const resolveThemeForUI = (storedTheme: ThemePreference | null): ThemePreference =>
  storedTheme ?? getSystemTheme();

const HeaderNavLink = ({ to, children }: { to: string; children: string }) => (
  <NavLink
    to={to}
    end={to === '/'}
    className={({ isActive }) =>
      `rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition ${
        isActive
          ? 'bg-[var(--accent)] text-white shadow-sm'
          : 'text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]'
      }`
    }
  >
    {children}
  </NavLink>
);
