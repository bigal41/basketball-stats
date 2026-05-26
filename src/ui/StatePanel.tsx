interface StatePanelProps {
  title: string;
  body: string;
}

export const StatePanel = ({ title, body }: StatePanelProps) => (
  <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel-bg)] p-6 text-center shadow-xl backdrop-blur sm:p-8">
    <h2 className="text-xl font-bold text-[var(--text-primary)]">{title}</h2>
    <p className="mt-2 text-sm text-[var(--text-secondary)]">{body}</p>
  </div>
);
