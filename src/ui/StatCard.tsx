interface StatCardProps {
  label: string;
  value: string;
  accent?: string;
}

export const StatCard = ({
  label,
  value,
  accent = 'from-orange-300/30 to-emerald-300/10',
}: StatCardProps) => (
  <article className={`rounded-[1.75rem] border border-[var(--border)] bg-gradient-to-br ${accent} p-[1px] shadow-xl`}>
    <div className="h-full rounded-[1.7rem] bg-[var(--panel-strong)] p-4 backdrop-blur sm:p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-3 text-3xl font-black text-[var(--text-primary)]">{value}</p>
    </div>
  </article>
);
