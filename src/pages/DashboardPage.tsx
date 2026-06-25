import { Link } from 'react-router-dom';
import { useDashboardData } from '../hooks/useDashboardData';
import { useStatsMode } from '../hooks/useStatsMode';
import type { GameType } from '../types';
import {
  formatRecord,
  formatAverage,
  getCompletedGames,
  getCompletedRegularSeasonGames,
  getRecord,
  getStatCoverage,
  getStatsForMode,
  getTeamLeaders,
  sumStatLines,
} from '../lib/stats';
import { DeferredPlayerBarChart, DeferredTeamTrendChart } from '../ui/LazyCharts';
import { PlayerBadge } from '../ui/PlayerBadge';
import { SectionCard } from '../ui/SectionCard';
import { StatePanel } from '../ui/StatePanel';
import { StatCard } from '../ui/StatCard';
import { StatsModeToggle } from '../ui/StatsModeToggle';

export const DashboardPage = () => {
  const { data, isLoading, error } = useDashboardData();
  const { statsMode, setStatsMode } = useStatsMode();

  if (isLoading) {
    return <StatePanel title="Loading season" body="Pulling games, players, and stats." />;
  }

  if (error || !data) {
    return <StatePanel title="Data unavailable" body={error ?? 'Unable to load season data.'} />;
  }

  const completedGames = getCompletedGames(data.games);
  const completedRegularSeasonGames = getCompletedRegularSeasonGames(data.games);
  const record = getRecord(data.games);
  const regularSeasonRecord = getRecord(completedRegularSeasonGames);
  const coverage = getStatCoverage(data.games, data.playerGameStats);
  const activeStats = getStatsForMode(data.games, data.players, data.playerGameStats, statsMode);
  const activeGameCount = new Set(activeStats.map((stat) => stat.gameId)).size;
  const totalGames = activeGameCount || 1;
  const seasonTotals = sumStatLines(activeStats);
  const teamTrendData = completedGames.map((game) => ({
    game: game.opponent,
    points: game.teamScore ?? 0,
    differential: (game.teamScore ?? 0) - (game.oppScore ?? 0),
  }));
  const scorers = getTeamLeaders(activeStats, data.players, 'pts').map((entry) => ({
    name: entry.player.name,
    value: entry.value,
  }));
  const statsModeSummary =
    statsMode === 'estimated'
      ? `Estimated stats fill ${coverage.missingStatGames} missing completed game${
          coverage.missingStatGames === 1 ? '' : 's'
        } from recorded player shares.`
      : `Recorded box scores are available for ${coverage.statBackedGames} of ${coverage.completedGames} completed games.`;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3 rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel-bg)] p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)]">Stats Mode</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{statsModeSummary}</p>
        </div>
        <StatsModeToggle mode={statsMode} onChange={setStatsMode} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Record"
          value={`${formatRecord(record)} (${formatRecord(regularSeasonRecord)})`}
        />
        <StatCard
          label="PPG"
          value={formatAverage(seasonTotals.pts / totalGames)}
          accent="from-sky-300/30 to-blue-300/10"
        />
        <StatCard
          label="RPG"
          value={formatAverage(seasonTotals.reb / totalGames)}
          accent="from-emerald-300/30 to-teal-300/10"
        />
        <StatCard
          label="APG"
          value={formatAverage(seasonTotals.ast / totalGames)}
          accent="from-amber-300/30 to-orange-300/10"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <SectionCard
          title="Schedule & Results"
          action={
            <a
              href="/ballers_united_schedule.ics"
              download="ballers_united_schedule.ics"
              className="rounded-full border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)] transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
            >
              Download ICS
            </a>
          }
        >
          <div className="space-y-3 xl:max-h-[31.5rem] xl:overflow-y-auto xl:pr-2">
            {data.games.map((game) => (
              <Link
                key={game.id}
                to={`/games/${game.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-4 transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-muted)]">{game.date}</p>
                    <GameTypeBadge gameType={game.gameType} />
                  </div>
                  <p className="mt-1 text-base font-bold text-[var(--text-primary)] sm:text-lg">vs {game.opponent}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.3em] ${
                      game.status === 'completed' ? 'text-[var(--success)]' : 'text-[var(--info)]'
                    }`}
                  >
                    {game.status}
                  </p>
                  <p className="mt-2 text-base font-black text-[var(--text-primary)] sm:text-lg">
                    {game.status === 'completed'
                      ? `${game.teamScore ?? 0} - ${game.oppScore ?? 0}`
                      : 'Upcoming'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Top Scorers">
          <div className="space-y-3">
            {getTeamLeaders(activeStats, data.players, 'pts').map((leader) => (
              <Link
                key={leader.player.id}
                to={`/players/${leader.player.id}`}
                className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3 transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)]"
              >
                <span className="font-semibold text-[var(--text-primary)]">
                  {leader.player.name}
                  {leader.player.sub ? <PlayerBadge label="Sub" tone="muted" /> : null}
                </span>
                <span className="text-sm font-bold text-[var(--accent)]">{leader.value} pts</span>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>

      {data.futureGameProjections.length > 0 ? (
        <SectionCard title="Projections">
          <div className="space-y-3">
            {data.futureGameProjections.map((projection) => (
              <article
                key={projection.gameId}
                className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-4"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)]">
                    {projection.date}
                  </p>
                  <p className="mt-1 text-base font-bold text-[var(--text-primary)]">
                    vs {projection.opponent}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)]">
                    Win Probability
                  </p>
                  <p className="mt-1 text-lg font-black text-[var(--accent)]">
                    {formatProjectionWinProbability(projection.winProbability)}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--text-secondary)]">
                    Spread: {formatProjectionSpread(projection.projectedSpread)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
      ) : null}

      <SectionCard title="Team Trends">
        {teamTrendData.length === 0 ? (
          <StatePanel title="No completed games yet" body="Completed games will unlock trend charts." />
        ) : (
          <DeferredTeamTrendChart data={teamTrendData} />
        )}
      </SectionCard>

      <SectionCard title="Season Scoring Leaders">
        <DeferredPlayerBarChart data={scorers} />
      </SectionCard>
    </div>
  );
};

const formatProjectionWinProbability = (winProbability: number): string =>
  `${(winProbability * 100).toFixed(1)}%`;

const formatProjectionSpread = (projectedSpread: number): string => {
  if (projectedSpread === 0) {
    return "Pick'em";
  }

  return `Ballers United ${projectedSpread > 0 ? '+' : ''}${projectedSpread.toFixed(1)}`;
};

const GameTypeBadge = ({ gameType }: { gameType?: GameType }) => {
  if (!gameType || gameType === 'regular') {
    return null;
  }

  const label = gameType === 'playoff' ? 'Playoff' : 'Preseason';

  return (
    <span className="rounded-full border border-[var(--border)] bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
      {label}
    </span>
  );
};
