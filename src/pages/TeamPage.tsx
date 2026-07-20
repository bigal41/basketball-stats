import { Link, useParams } from 'react-router-dom';
import { useDashboardData } from '../hooks/useDashboardData';
import { getTodayIsoDate } from '../lib/elo';
import {
  buildLeagueStandings,
  findLeagueTeamBySlug,
  formatPointDifferential,
  formatWinPct,
  getTeamLeagueGames,
} from '../lib/league';
import { DeferredTeamTrendChart } from '../ui/LazyCharts';
import { PlayerBadge } from '../ui/PlayerBadge';
import { SectionCard } from '../ui/SectionCard';
import { StatePanel } from '../ui/StatePanel';
import { StatCard } from '../ui/StatCard';

export const TeamPage = () => {
  const { teamSlug } = useParams();
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return <StatePanel title="Loading team" body="Pulling team results and projections." />;
  }

  if (error || !data || !teamSlug) {
    return <StatePanel title="Team unavailable" body={error ?? 'Unable to load this team.'} />;
  }

  const teamName = findLeagueTeamBySlug(data.leagueGames, teamSlug);

  if (!teamName) {
    return <StatePanel title="Team not found" body="The requested team does not exist." />;
  }

  const standings = buildLeagueStandings(data.leagueGames);
  const standing = standings.find((entry) => entry.team === teamName);
  const rank = standing ? standings.findIndex((entry) => entry.team === teamName) + 1 : null;
  const teamGames = getTeamLeagueGames(data.leagueGames, teamName).sort((left, right) =>
    left.date === right.date ? left.id.localeCompare(right.id) : left.date.localeCompare(right.date),
  );
  const completedGames = teamGames.filter(
    (game) => game.status === 'completed' && typeof game.homeScore === 'number' && typeof game.awayScore === 'number',
  );
  const upcomingGames = teamGames.filter((game) => game.status !== 'completed' && game.date >= getTodayIsoDate());
  const currentElo = data.currentRatingsByTeam[teamName]?.rating;
  const projectionById = new Map(
    data.futureLeagueGameProjections.map((projection) => [projection.gameId, projection]),
  );
  const trendData = completedGames.map((game) => {
    const isHome = game.homeTeam === teamName;
    const opponent = isHome ? game.awayTeam : game.homeTeam;
    const teamScore = isHome ? game.homeScore : game.awayScore;
    const oppScore = isHome ? game.awayScore : game.homeScore;

    return {
      game: opponent,
      points: teamScore,
      differential: teamScore - oppScore,
    };
  });
  const recentForm = completedGames
    .slice(-5)
    .reverse()
    .map((game) => {
      const isHome = game.homeTeam === teamName;
      const teamScore = isHome ? game.homeScore : game.awayScore;
      const oppScore = isHome ? game.awayScore : game.homeScore;

      return teamScore > oppScore ? 'W' : 'L';
    });
  const pointsForPerGame = standing && standing.gamesPlayed > 0 ? standing.pointsFor / standing.gamesPlayed : 0;
  const pointsAgainstPerGame = standing && standing.gamesPlayed > 0 ? standing.pointsAgainst / standing.gamesPlayed : 0;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3 rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel-bg)] p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)]">League Team</p>
          <h1 className="mt-1 text-2xl font-black text-[var(--text-primary)]">{teamName}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--text-secondary)]">
            {rank ? <span>Rank #{rank}</span> : null}
            {standing ? <span>{standing.wins}-{standing.losses}</span> : null}
            {standing ? <span>{formatWinPct(standing.winPct)} win pct</span> : null}
            {recentForm.length > 0 ? (
              <span className="flex items-center gap-1">
                <span>Recent form</span>
                {recentForm.map((result, index) => (
                  <PlayerBadge key={`${result}_${index}`} label={result} tone={result === 'W' ? 'accent' : 'muted'} />
                ))}
              </span>
            ) : null}
          </div>
        </div>
        <Link to="/standings" className="text-sm font-semibold text-[var(--accent)]">
          Back to standings
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Record" value={standing ? `${standing.wins}-${standing.losses}` : '0-0'} />
        <StatCard
          label="Point Diff"
          value={standing ? formatPointDifferential(standing.pointDifferential) : '0'}
          accent="from-amber-300/30 to-orange-300/10"
        />
        <StatCard
          label="PF / PA"
          value={`${pointsForPerGame.toFixed(1)} / ${pointsAgainstPerGame.toFixed(1)}`}
          accent="from-emerald-300/30 to-teal-300/10"
        />
        <StatCard
          label="ELO"
          value={currentElo === undefined ? '1200' : `${Math.round(currentElo)}`}
          accent="from-sky-300/30 to-blue-300/10"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <SectionCard title="Season Results">
          {completedGames.length === 0 ? (
            <StatePanel title="No completed games" body="Completed results will appear here." />
          ) : (
            <div className="space-y-3">
              {completedGames
                .slice()
                .reverse()
                .map((game) => {
                  const isHome = game.homeTeam === teamName;
                  const opponent = isHome ? game.awayTeam : game.homeTeam;
                  const teamScore = isHome ? game.homeScore : game.awayScore;
                  const oppScore = isHome ? game.awayScore : game.homeScore;
                  const didWin = teamScore > oppScore;

                  return (
                    <article
                      key={game.id}
                      className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-4 md:grid-cols-[0.7fr_1.5fr_0.9fr]"
                    >
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)]">
                          {game.date}
                        </p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-secondary)]">
                          {isHome ? 'Home' : 'Away'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-secondary)]">
                          {isHome ? 'vs' : '@'} {opponent}
                        </p>
                        <p className="mt-1 text-lg font-black text-[var(--text-primary)]">
                          {teamScore} - {oppScore}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-semibold uppercase tracking-[0.25em] ${didWin ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}>
                          {didWin ? 'Win' : 'Loss'}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[var(--text-secondary)]">
                          Diff {formatPointDifferential(teamScore - oppScore)}
                        </p>
                      </div>
                    </article>
                  );
                })}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Upcoming Outlook">
          {upcomingGames.length === 0 ? (
            <StatePanel title="No upcoming games" body="The remaining schedule is complete." />
          ) : (
            <div className="space-y-3">
              {upcomingGames.map((game) => {
                const projection = projectionById.get(game.id);
                const isHome = game.homeTeam === teamName;
                const opponent = isHome ? game.awayTeam : game.homeTeam;
                const winProbability = projection
                  ? isHome
                    ? projection.homeWinProbability
                    : projection.awayWinProbability
                  : null;

                return (
                  <article
                    key={game.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)]">
                          {game.date}
                        </p>
                        <p className="mt-1 text-base font-bold text-[var(--text-primary)]">
                          {isHome ? 'vs' : '@'} {opponent}
                        </p>
                        <p className="mt-2 text-sm text-[var(--text-secondary)]">
                          {isHome ? 'Home court' : 'Road game'}
                        </p>
                      </div>
                      {winProbability === null ? (
                        <p className="text-sm font-semibold text-[var(--text-muted)]">Projection pending</p>
                      ) : (
                        <div className="text-right">
                          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)]">
                            Win Probability
                          </p>
                          <p className="mt-1 text-lg font-black text-[var(--accent)]">
                            {formatProjectedWinProbability(winProbability)}
                          </p>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Scoring Trend">
        {trendData.length === 0 ? (
          <StatePanel title="No trend data yet" body="Completed games will unlock the team trend chart." />
        ) : (
          <DeferredTeamTrendChart data={trendData} />
        )}
      </SectionCard>
    </div>
  );
};

const formatProjectedWinProbability = (winProbability: number): string =>
  `${(winProbability * 100).toFixed(1)}%`;
