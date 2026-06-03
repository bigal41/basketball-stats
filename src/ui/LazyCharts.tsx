import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

const TeamTrendChart = lazy(async () => {
  const module = await import('./Charts');
  return { default: module.TeamTrendChart };
});

const PlayerBarChart = lazy(async () => {
  const module = await import('./Charts');
  return { default: module.PlayerBarChart };
});

const PlayerTrendChart = lazy(async () => {
  const module = await import('./Charts');
  return { default: module.PlayerTrendChart };
});

export const DeferredTeamTrendChart = ({
  data,
}: {
  data: Array<{ game: string; points: number; differential: number }>;
}) => (
  <DeferredChart>
    <TeamTrendChart data={data} />
  </DeferredChart>
);

export const DeferredPlayerBarChart = ({
  data,
  attemptKey,
  barKey,
}: {
  data: Array<{ name: string; value: number; attempts?: number }>;
  barKey?: string;
  attemptKey?: string;
}) => (
  <DeferredChart>
    <PlayerBarChart data={data} attemptKey={attemptKey} barKey={barKey} />
  </DeferredChart>
);

export const DeferredPlayerTrendChart = ({
  data,
}: {
  data: Array<{ label: string; pts: number; reb: number; ast: number; fgPct: number; tpPct: number }>;
}) => (
  <DeferredChart minHeightClassName="min-h-[36rem] lg:min-h-[18rem]">
    <PlayerTrendChart data={data} />
  </DeferredChart>
);

const DeferredChart = ({
  children,
  minHeightClassName = 'min-h-72',
}: {
  children: ReactNode;
  minHeightClassName?: string;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node || shouldRender) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldRender]);

  return (
    <div ref={ref} className={minHeightClassName}>
      {shouldRender ? (
        <Suspense fallback={<ChartPlaceholder minHeightClassName={minHeightClassName} />}>
          {children}
        </Suspense>
      ) : (
        <ChartPlaceholder minHeightClassName={minHeightClassName} />
      )}
    </div>
  );
};

const ChartPlaceholder = ({ minHeightClassName }: { minHeightClassName: string }) => (
  <div
    className={`flex w-full items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] ${minHeightClassName}`}
  >
    <span className="text-sm text-[var(--text-muted)]">Loading chart...</span>
  </div>
);
