import { Link } from 'react-router-dom';
import { useDashboardData } from '../hooks/useDashboardData';
import {
  buildLeagueStandings,
  formatPointDifferential,
  formatWinPct,
  slugifyTeamName,
} from '../lib/league';
import { SectionCard } from '../ui/SectionCard';
import { StatePanel } from '../ui/StatePanel';

export const StandingsPage = () => {
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return <StatePanel title="Loading standings" body="Pulling league schedule and results." />;
  }

  if (error || !data) {
    return <StatePanel title="Standings unavailable" body={error ?? 'Unable to load league schedule and results.'} />;
  }

  const standings = buildLeagueStandings(data.leagueGames);
  const completedLeagueGames = data.leagueGames.filter((game) => game.status === 'completed');
  const officialThroughDate = completedLeagueGames.reduce<string | null>(
    (latest, game) => (latest === null || game.date > latest ? game.date : latest),
    null,
  );
  const projectedLeagueGamesById = new Map(
    data.futureLeagueGameProjections.map((projection) => [projection.gameId, projection]),
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3 rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel-bg)] p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)]">League</p>
          <h1 className="mt-1 text-2xl font-black text-[var(--text-primary)]">Standings</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Official results through {formatDisplayDate(officialThroughDate)}.
          </p>
        </div>
        <Link to="/" className="text-sm font-semibold text-[var(--accent)]">
          Back to dashboard
        </Link>
      </section>

      <SectionCard title="League Standings">
        <div className="overflow-x-auto">
          <table className="min-w-[760px] border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.25em] text-[var(--text-muted)]">
                <th className="px-3">Rank</th>
                <th className="px-3">Team</th>
                <th className="px-3">W</th>
                <th className="px-3">L</th>
                <th className="px-3">PCT</th>
                <th className="px-3">PF</th>
                <th className="px-3">PA</th>
                <th className="px-3">DIFF</th>
                <th className="px-3">ELO</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((standing, index) => {
                const isBallersUnited = standing.team === 'Ballers United';
                const teamElo = data.currentRatingsByTeam[standing.team]?.rating;

                return (
                  <tr
                    key={standing.team}
                    className={`text-sm ${
                      isBallersUnited
                        ? 'bg-[var(--accent-soft)] font-bold text-[var(--accent)]'
                        : 'bg-[var(--table-row)] text-[var(--text-primary)]'
                    }`}
                  >
                    <td className="rounded-l-2xl px-3 py-3">{index + 1}</td>
                    <td className="px-3 py-3">
                      <Link
                        to={`/teams/${slugifyTeamName(standing.team)}`}
                        className="font-semibold transition hover:text-[var(--accent)]"
                      >
                        {standing.team}
                      </Link>
                    </td>
                    <td className="px-3 py-3">{standing.wins}</td>
                    <td className="px-3 py-3">{standing.losses}</td>
                    <td className="px-3 py-3">{formatWinPct(standing.winPct)}</td>
                    <td className="px-3 py-3">{standing.pointsFor}</td>
                    <td className="px-3 py-3">{standing.pointsAgainst}</td>
                    <td className="px-3 py-3">
                      {formatPointDifferential(standing.pointDifferential)}
                    </td>
                    <td className="rounded-r-2xl px-3 py-3">
                      {formatStandingElo(teamElo)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="League Schedule & Results">
        <div className="space-y-3">
          {data.leagueGames.map((game) => {
            const projection = projectedLeagueGamesById.get(game.id);
            const homeWon = (game.homeScore ?? 0) > (game.awayScore ?? 0);

            return (
              <article
                key={game.id}
                className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-4 md:grid-cols-[0.75fr_1.4fr_1.4fr]"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)]">
                    {game.date}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-secondary)]">
                    {game.status === 'completed' ? 'Completed' : 'Scheduled'}
                  </p>
                </div>
                {game.status === 'completed' ? (
                  <>
                    <TeamScore team={game.homeTeam} score={game.homeScore ?? 0} isWinner={homeWon} />
                    <TeamScore team={game.awayTeam} score={game.awayScore ?? 0} isWinner={!homeWon} />
                  </>
                ) : projection ? (
                  <>
                    <ProjectedTeamOdds
                      team={projection.homeTeam}
                      winProbability={projection.homeWinProbability}
                    />
                    <ProjectedTeamOdds
                      team={projection.awayTeam}
                      winProbability={projection.awayWinProbability}
                    />
                  </>
                ) : (
                  <>
                    <ScheduledTeam team={game.homeTeam} />
                    <ScheduledTeam team={game.awayTeam} />
                  </>
                )}
              </article>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
};

const formatDisplayDate = (date: string | null): string => {
  if (!date) {
    return 'No official games yet';
  }

  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const TeamScore = ({
  team,
  score,
  isWinner,
}: {
  team: string;
  score: number;
  isWinner: boolean;
}) => (
  <div className="flex items-center justify-between gap-4 rounded-xl bg-[var(--table-row)] px-3 py-3">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
        {isWinner ? 'Winner' : 'Team'}
      </p>
      <p className="mt-1 font-bold text-[var(--text-primary)]">{team}</p>
    </div>
    <p className={`text-2xl font-black ${isWinner ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
      {score}
    </p>
  </div>
);

const ProjectedTeamOdds = ({
  team,
  winProbability,
}: {
  team: string;
  winProbability: number;
}) => (
  <div className="flex items-center justify-between gap-4 rounded-xl bg-[var(--table-row)] px-3 py-3">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
        Win Probability
      </p>
      <p className="mt-1 font-bold text-[var(--text-primary)]">{team}</p>
    </div>
    <p className="text-2xl font-black text-[var(--accent)]">{formatProjectedWinProbability(winProbability)}</p>
  </div>
);

const formatProjectedWinProbability = (winProbability: number): string =>
  `${(winProbability * 100).toFixed(1)}%`;

const formatStandingElo = (rating: number | undefined): string =>
  rating === undefined ? '1200' : `${Math.round(rating)}`;

const ScheduledTeam = ({ team }: { team: string }) => (
  <div className="flex items-center justify-between gap-4 rounded-xl bg-[var(--table-row)] px-3 py-3">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
        Scheduled
      </p>
      <p className="mt-1 font-bold text-[var(--text-primary)]">{team}</p>
    </div>
    <p className="text-sm font-semibold text-[var(--text-muted)]">TBD</p>
  </div>
);
