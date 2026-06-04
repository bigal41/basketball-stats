import type { StatsMode } from '../lib/stats';

interface StatsModeToggleProps {
  mode: StatsMode;
  onChange: (mode: StatsMode) => void;
}

export const StatsModeToggle = ({ mode, onChange }: StatsModeToggleProps) => (
  <div className="inline-flex w-fit self-start items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--panel-soft)] p-1 shadow-sm backdrop-blur">
    <StatsModeButton label="Real" selected={mode === 'real'} onClick={() => onChange('real')} />
    <StatsModeButton label="Estimated" selected={mode === 'estimated'} onClick={() => onChange('estimated')} />
  </div>
);

interface StatsModeButtonProps {
  label: string;
  onClick: () => void;
  selected: boolean;
}

const StatsModeButton = ({ label, onClick, selected }: StatsModeButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition ${
      selected
        ? 'bg-[var(--accent)] text-white shadow-sm'
        : 'text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]'
    }`}
    aria-pressed={selected}
  >
    {label}
  </button>
);
