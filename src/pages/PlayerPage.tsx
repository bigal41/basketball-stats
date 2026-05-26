import { Link, useParams } from 'react-router-dom';
import { useSeasonData } from '../hooks/useSeasonData';
import {
  averageStatLine,
  calculatePercentage,
  formatAverage,
  formatPercentage,
  getPlayerStatsForPlayer,
  sumStatLines,
} from '../lib/stats';
import { DeferredPlayerTrendChart } from '../ui/LazyCharts';
import { SectionCard } from '../ui/SectionCard';
import { StatePanel } from '../ui/StatePanel';
import { StatCard } from '../ui/StatCard';

export const PlayerPage = () => {
  const { playerId } = useParams();
  const { data, isLoading, error } = useSeasonData();

  if (isLoading) {
    return <StatePanel title="Loading player" body="Pulling season totals and game log." />;
  }

  if (error || !data || !playerId) {
    return <StatePanel title="Player unavailable" body={error ?? 'Unable to load this player.'} />;
  }

  const player = data.players.find((entry) => entry.id === playerId);

  if (!player) {
    return <StatePanel title="Player not found" body="The requested player does not exist." />;
  }

  const stats = getPlayerStatsForPlayer(data.playerGameStats, player.id);
  const totals = sumStatLines(stats);
  const averages = averageStatLine(stats);
  const gamesById = new Map(data.games.map((game) => [game.id, game]));
  const chartData = stats
    .map((stat) => {
      const game = gamesById.get(stat.gameId);

      return {
        label: game?.opponent ?? stat.gameId,
        pts: stat.pts,
        reb: stat.reb,
        ast: stat.ast,
        fgPct: calculatePercentage(stat.fgm, stat.fga),
        tpPct: calculatePercentage(stat.tpm, stat.tpa),
      };
    })
    .sort((left, right) => left.label.localeCompare(right.label));

  return (
    <div className="flex flex-col gap-6">
      <SectionCard
        title={player.name}
        action={<Link to="/" className="text-sm font-semibold text-[var(--accent)]">Back to dashboard</Link>}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Points" value={`${totals.pts}`} />
          <StatCard label="PPG" value={formatAverage(averages.pts)} accent="from-sky-300/30 to-blue-300/10" />
          <StatCard label="RPG" value={formatAverage(averages.reb)} accent="from-emerald-300/30 to-teal-300/10" />
          <StatCard label="APG" value={formatAverage(averages.ast)} accent="from-amber-300/30 to-orange-300/10" />
        </div>
      </SectionCard>

      <SectionCard title="Season Totals">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">FG</p>
            <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">
              {totals.fgm}/{totals.fga} ({formatPercentage(calculatePercentage(totals.fgm, totals.fga))})
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">3PT</p>
            <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">
              {totals.tpm}/{totals.tpa} ({formatPercentage(calculatePercentage(totals.tpm, totals.tpa))})
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Steals</p>
            <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">{totals.stl}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Blocks</p>
            <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">{totals.blk}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Games</p>
            <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">{stats.length}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Game Trends">
        {chartData.length === 0 ? (
          <StatePanel title="No games played" body="Player trends appear after completed games." />
        ) : (
          <DeferredPlayerTrendChart data={chartData} />
        )}
      </SectionCard>

      <SectionCard title="Game Log">
        {stats.length === 0 ? (
          <StatePanel title="No game log yet" body="This player has no recorded box scores." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[720px] border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.25em] text-[var(--text-muted)]">
                  <th className="px-3">Date</th>
                  <th className="px-3">Opponent</th>
                  <th className="px-3">PTS</th>
                  <th className="px-3">REB</th>
                  <th className="px-3">AST</th>
                  <th className="px-3">FG%</th>
                  <th className="px-3">3PT%</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat) => {
                  const game = gamesById.get(stat.gameId);
                  return (
                    <tr key={`${stat.gameId}_${stat.playerId}`} className="bg-[var(--table-row)] text-sm text-[var(--text-primary)]">
                      <td className="rounded-l-2xl px-3 py-3">{game?.date ?? '--'}</td>
                      <td className="px-3 py-3">
                        <Link className="hover:text-[var(--accent)]" to={`/games/${stat.gameId}`}>
                          {game?.opponent ?? stat.gameId}
                        </Link>
                      </td>
                      <td className="px-3 py-3">{stat.pts}</td>
                      <td className="px-3 py-3">{stat.reb}</td>
                      <td className="px-3 py-3">{stat.ast}</td>
                      <td className="px-3 py-3">{formatPercentage(calculatePercentage(stat.fgm, stat.fga))}</td>
                      <td className="rounded-r-2xl px-3 py-3">
                        {formatPercentage(calculatePercentage(stat.tpm, stat.tpa))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
};
