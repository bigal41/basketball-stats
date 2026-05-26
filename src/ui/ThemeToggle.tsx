import type { ReactNode } from 'react';
import type { ThemePreference } from '../lib/theme';

interface ThemeToggleProps {
  theme: ThemePreference;
  onChange: (theme: ThemePreference) => void;
}

export const ThemeToggle = ({ theme, onChange }: ThemeToggleProps) => (
  <div className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--panel-soft)] p-1 shadow-sm backdrop-blur">
    <ThemeIconButton
      label="Light mode"
      selected={theme === 'light'}
      onClick={() => onChange('light')}
      icon={<SunIcon />}
    />
    <ThemeIconButton
      label="Dark mode"
      selected={theme === 'dark'}
      onClick={() => onChange('dark')}
      icon={<MoonIcon />}
    />
  </div>
);

interface ThemeIconButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  selected: boolean;
}

const ThemeIconButton = ({ icon, label, onClick, selected }: ThemeIconButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
      selected
        ? 'bg-[var(--accent)] text-white shadow-sm'
        : 'text-[var(--text-secondary)] hover:bg-[var(--accent-soft)]'
    }`}
    aria-label={label}
    aria-pressed={selected}
  >
    {icon}
  </button>
);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="4.25" />
    <path d="M12 2.75v2.1M12 19.15v2.1M21.25 12h-2.1M4.85 12h-2.1M18.54 5.46l-1.49 1.49M6.95 17.05l-1.49 1.49M18.54 18.54l-1.49-1.49M6.95 6.95 5.46 5.46" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
    <path d="M14.9 2.75c.28 0 .45.31.28.53a8.17 8.17 0 0 0 5.89 13.15c.3.03.42.43.18.63A10.4 10.4 0 1 1 9.97 2.98c1.61-.3 3.3-.38 4.93-.23Z" />
  </svg>
);
