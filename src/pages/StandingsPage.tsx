import { Link } from 'react-router-dom';
import { useLeagueResults } from '../hooks/useLeagueResults';
import {
  buildLeagueStandings,
  formatPointDifferential,
  formatWinPct,
} from '../lib/league';
import { SectionCard } from '../ui/SectionCard';
import { StatePanel } from '../ui/StatePanel';

const officialThroughDate = 'May 26, 2026';

export const StandingsPage = () => {
  const { data, isLoading, error } = useLeagueResults();

  if (isLoading) {
    return <StatePanel title="Loading standings" body="Pulling league results." />;
  }

  if (error || !data) {
    return <StatePanel title="Standings unavailable" body={error ?? 'Unable to load league results.'} />;
  }

  const standings = buildLeagueStandings(data);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3 rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel-bg)] p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)]">League</p>
          <h1 className="mt-1 text-2xl font-black text-[var(--text-primary)]">Standings</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Official results through {officialThroughDate}. June 2 games are excluded until official.
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
              </tr>
            </thead>
            <tbody>
              {standings.map((standing, index) => {
                const isBallersUnited = standing.team === 'Ballers United';

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
                    <td className="px-3 py-3">{standing.team}</td>
                    <td className="px-3 py-3">{standing.wins}</td>
                    <td className="px-3 py-3">{standing.losses}</td>
                    <td className="px-3 py-3">{formatWinPct(standing.winPct)}</td>
                    <td className="px-3 py-3">{standing.pointsFor}</td>
                    <td className="px-3 py-3">{standing.pointsAgainst}</td>
                    <td className="rounded-r-2xl px-3 py-3">
                      {formatPointDifferential(standing.pointDifferential)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Official Results">
        <div className="space-y-3">
          {data.map((result) => {
            const homeWon = result.homeScore > result.awayScore;

            return (
              <article
                key={result.id}
                className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-4 md:grid-cols-[0.75fr_1.4fr_1.4fr]"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)]">
                    {result.date}
                  </p>
                </div>
                <TeamScore team={result.homeTeam} score={result.homeScore} isWinner={homeWon} />
                <TeamScore team={result.awayTeam} score={result.awayScore} isWinner={!homeWon} />
              </article>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
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
