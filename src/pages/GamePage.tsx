import { Link, useParams } from 'react-router-dom';
import { useStatsMode } from '../hooks/useStatsMode';
import { useSeasonData } from '../hooks/useSeasonData';
import { calculatePercentage, formatPercentage, getPlayerStatsForGame, getStatsForMode, sumStatLines } from '../lib/stats';
import { DeferredPlayerBarChart } from '../ui/LazyCharts';
import { PlayerBadge } from '../ui/PlayerBadge';
import { SectionCard } from '../ui/SectionCard';
import { StatePanel } from '../ui/StatePanel';
import { StatsModeToggle } from '../ui/StatsModeToggle';

export const GamePage = () => {
  const { gameId } = useParams();
  const { data, isLoading, error } = useSeasonData();
  const { statsMode, setStatsMode } = useStatsMode();

  if (isLoading) {
    return <StatePanel title="Loading game" body="Pulling box score details." />;
  }

  if (error || !data || !gameId) {
    return <StatePanel title="Game unavailable" body={error ?? 'Unable to load this game.'} />;
  }

  const game = data.games.find((entry) => entry.id === gameId);

  if (!game) {
    return <StatePanel title="Game not found" body="The requested game does not exist." />;
  }

  const recordedStats = getPlayerStatsForGame(data.playerGameStats, game.id);
  const hasRecordedStats = recordedStats.length > 0;
  const canEstimateStats = !hasRecordedStats && game.status === 'completed';
  const activeSeasonStats = canEstimateStats
    ? getStatsForMode(data.games, data.players, data.playerGameStats, statsMode)
    : [];
  const stats = hasRecordedStats
    ? recordedStats.map((stat) => ({ ...stat, isEstimated: false }))
    : getPlayerStatsForGame(activeSeasonStats, game.id);
  const playerLookup = new Map(data.players.map((player) => [player.id, player]));
  const totals = sumStatLines(stats);
  const hasEstimatedStats = stats.some((stat) => stat.isEstimated);
  const absentPlayerNames = new Set((game.absentPlayerNames ?? []).map((name) => name.trim().toLowerCase()));
  const absentPlayers = data.players.filter((player) => absentPlayerNames.has(player.name.trim().toLowerCase()));
  const chartData = stats.map((stat) => ({
    name: playerLookup.get(stat.playerId)?.name ?? stat.playerId,
    value: stat.pts,
    attempts: stat.fga,
  }));
  const shootingSummary =
    stats.length > 0
      ? `${formatPercentage(calculatePercentage(totals.fgm, totals.fga))} / ${formatPercentage(
          calculatePercentage(totals.tpm, totals.tpa),
        )}`
      : 'No stats';
  const videoLinks =
    game.youtubeUrls ?? (game.youtubeUrl ? [{ label: 'Watch game', url: game.youtubeUrl }] : []);

  return (
    <div className="flex flex-col gap-6">
      <SectionCard
        title={`${game.status === 'completed' ? 'Final' : 'Scheduled'} vs ${game.opponent}`}
        action={
          <div className="flex flex-wrap items-center justify-end gap-3">
            {canEstimateStats ? <StatsModeToggle mode={statsMode} onChange={setStatsMode} /> : null}
            {videoLinks.map((videoLink) => (
              <a
                key={videoLink.url}
                href={videoLink.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold transition hover:opacity-80"
                style={{ color: 'var(--youtube-link)' }}
              >
                <YoutubeIcon />
                {videoLink.label}
              </a>
            ))}
            <Link to="/" className="text-sm font-semibold text-[var(--accent)]">
              Back to dashboard
            </Link>
          </div>
        }
      >
        {game.excludeFromSeasonStats || game.statsNote ? (
          <div className="mb-4 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-4 py-3 text-sm font-semibold text-[var(--accent)]">
            {game.statsNote ?? 'This box score is excluded from season averages and totals.'}
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Date</p>
            <p className="mt-2 text-xl font-bold text-[var(--text-primary)]">{game.date}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Score</p>
            <p className="mt-2 text-xl font-bold text-[var(--text-primary)]">
              {game.status === 'completed' ? `${game.teamScore ?? 0} - ${game.oppScore ?? 0}` : 'Upcoming'}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">FG / 3PT</p>
            <p className="mt-2 text-xl font-bold text-[var(--text-primary)]">
              {shootingSummary}
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Player Box Score">
        {stats.length === 0 ? (
          <StatePanel
            title={
              canEstimateStats && statsMode === 'estimated'
                ? 'Unable to estimate stats'
                : game.status === 'scheduled'
                  ? 'No box score yet'
                  : 'No stats collected'
            }
            body={
              canEstimateStats && statsMode === 'estimated'
                ? 'At least one completed game with recorded player stats is needed before estimates can be generated.'
                : game.status === 'scheduled'
                  ? 'This scheduled game has no player stats yet.'
                  : 'No player box score has been collected for this game.'
            }
          />
        ) : (
          <div className="space-y-4">
            {hasEstimatedStats ? (
              <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-4 py-3 text-sm font-semibold text-[var(--accent)]">
                Estimated box score. These values were generated from prior player shares and are not official stats.
              </div>
            ) : null}
            {hasEstimatedStats && absentPlayers.length > 0 ? (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                Excluded from estimates for this game: {absentPlayers.map((player) => player.name).join(', ')}.
              </div>
            ) : null}
            <div className="overflow-x-auto">
              <table className="min-w-[720px] border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.25em] text-[var(--text-muted)]">
                    <th className="px-3">Player</th>
                    <th className="px-3">PTS</th>
                    <th className="px-3">REB</th>
                    <th className="px-3">AST</th>
                    <th className="px-3">FG</th>
                    <th className="px-3">3PT</th>
                    <th className="px-3">STL</th>
                    <th className="px-3">BLK</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((stat) => (
                    <tr key={`${stat.gameId}_${stat.playerId}`} className="rounded-2xl bg-[var(--table-row)] text-sm text-[var(--text-primary)]">
                      <td className="rounded-l-2xl px-3 py-3 font-semibold">
                        <Link className="hover:text-[var(--accent)]" to={`/players/${stat.playerId}`}>
                          {playerLookup.get(stat.playerId)?.name ?? stat.playerId}
                        </Link>
                        {playerLookup.get(stat.playerId)?.sub ? <PlayerBadge label="Sub" tone="muted" /> : null}
                        {stat.isEstimated ? (
                          <PlayerBadge label="Est" />
                        ) : null}
                      </td>
                      <td className="px-3 py-3">{stat.pts}</td>
                      <td className="px-3 py-3">{stat.reb}</td>
                      <td className="px-3 py-3">{stat.ast}</td>
                      <td className="px-3 py-3">{stat.fgm}/{stat.fga}</td>
                      <td className="px-3 py-3">{stat.tpm}/{stat.tpa}</td>
                      <td className="px-3 py-3">{stat.stl}</td>
                      <td className="rounded-r-2xl px-3 py-3">{stat.blk}</td>
                    </tr>
                  ))}
                  <tr className="bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent)]">
                    <td className="rounded-l-2xl px-3 py-3">Team Totals</td>
                    <td className="px-3 py-3">{totals.pts}</td>
                    <td className="px-3 py-3">{totals.reb}</td>
                    <td className="px-3 py-3">{totals.ast}</td>
                    <td className="px-3 py-3">{totals.fgm}/{totals.fga}</td>
                    <td className="px-3 py-3">{totals.tpm}/{totals.tpa}</td>
                    <td className="px-3 py-3">{totals.stl}</td>
                    <td className="rounded-r-2xl px-3 py-3">{totals.blk}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </SectionCard>

      {stats.length > 0 ? (
        <SectionCard title="Scoring and Shot Volume">
          <DeferredPlayerBarChart data={chartData} attemptKey="attempts" />
        </SectionCard>
      ) : null}
    </div>
  );
};

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
  </svg>
);
