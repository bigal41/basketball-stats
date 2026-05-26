import { Link } from 'react-router-dom';
import { useSeasonData } from '../hooks/useSeasonData';
import {
  formatAverage,
  getCompletedGames,
  getPlayerStatsForGame,
  getRecord,
  getTeamLeaders,
  sumStatLines,
} from '../lib/stats';
import { PlayerBarChart, TeamTrendChart } from '../ui/Charts';
import { SectionCard } from '../ui/SectionCard';
import { StatePanel } from '../ui/StatePanel';
import { StatCard } from '../ui/StatCard';

export const DashboardPage = () => {
  const { data, isLoading, error } = useSeasonData();

  if (isLoading) {
    return <StatePanel title="Loading season" body="Pulling games, players, and stats." />;
  }

  if (error || !data) {
    return <StatePanel title="Data unavailable" body={error ?? 'Unable to load season data.'} />;
  }

  const completedGames = getCompletedGames(data.games);
  const record = getRecord(data.games);
  const completedGameTotals = completedGames.map((game) =>
    sumStatLines(getPlayerStatsForGame(data.playerGameStats, game.id)),
  );
  const totalGames = completedGames.length || 1;
  const seasonTotals = completedGameTotals.reduce(
    (totals, gameTotals) => ({
      pts: totals.pts + gameTotals.pts,
      reb: totals.reb + gameTotals.reb,
      ast: totals.ast + gameTotals.ast,
    }),
    { pts: 0, reb: 0, ast: 0 },
  );
  const teamTrendData = completedGames.map((game) => ({
    game: game.opponent,
    points: game.teamScore ?? 0,
    differential: (game.teamScore ?? 0) - (game.oppScore ?? 0),
  }));
  const scorers = getTeamLeaders(data.playerGameStats, data.players, 'pts').map((entry) => ({
    name: entry.player.name,
    value: entry.value,
  }));

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Record" value={`${record.wins}-${record.losses}`} />
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
          <div className="space-y-3">
            {data.games.map((game) => (
              <Link
                key={game.id}
                to={`/games/${game.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-4 transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)]"
              >
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-muted)]">{game.date}</p>
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
            {getTeamLeaders(data.playerGameStats, data.players, 'pts').map((leader) => (
              <Link
                key={leader.player.id}
                to={`/players/${leader.player.id}`}
                className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3 transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)]"
              >
                <span className="font-semibold text-[var(--text-primary)]">{leader.player.name}</span>
                <span className="text-sm font-bold text-[var(--accent)]">{leader.value} pts</span>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Team Trends">
        {teamTrendData.length === 0 ? (
          <StatePanel title="No completed games yet" body="Completed games will unlock trend charts." />
        ) : (
          <TeamTrendChart data={teamTrendData} />
        )}
      </SectionCard>

      <SectionCard title="Season Scoring Leaders">
        <PlayerBarChart data={scorers} />
      </SectionCard>
    </div>
  );
};
