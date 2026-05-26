import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export const SectionCard = ({ title, action, children }: SectionCardProps) => (
  <section className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel-bg)] p-4 shadow-2xl backdrop-blur sm:rounded-[1.75rem] sm:p-6">
    <div className="mb-5 flex items-center justify-between gap-4">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);
