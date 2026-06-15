interface PlayerBadgeProps {
  label: string;
  tone?: 'accent' | 'muted';
}

export const PlayerBadge = ({ label, tone = 'accent' }: PlayerBadgeProps) => {
  const className =
    tone === 'muted'
      ? 'bg-[var(--panel-soft)] text-[var(--text-secondary)] border border-[var(--border)]'
      : 'bg-[var(--accent-soft)] text-[var(--accent)]';

  return (
    <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${className}`}>
      {label}
    </span>
  );
};
