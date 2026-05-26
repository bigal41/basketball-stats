export type ThemePreference = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme-preference';

export const getSystemTheme = (): ThemePreference =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const getStoredTheme = (): ThemePreference | null => {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : null;
};

export const resolveTheme = (preference: ThemePreference | null): ThemePreference =>
  preference ?? getSystemTheme();

export const applyTheme = (preference: ThemePreference | null) => {
  document.documentElement.dataset.theme = resolveTheme(preference);
};
