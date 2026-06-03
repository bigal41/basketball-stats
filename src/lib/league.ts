import type { LeagueGameResult } from '../types';

export interface LeagueStanding {
  team: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDifferential: number;
  gamesPlayed: number;
  winPct: number;
}

export const leagueResults: LeagueGameResult[] = [
  {
    id: '2026-05-26-grape-soda-lamelos-balls',
    date: '2026-05-26',
    homeTeam: 'Grape Soda',
    awayTeam: "LaMelo's Balls",
    homeScore: 73,
    awayScore: 87,
  },
  {
    id: '2026-05-26-mount-sumit-pick-pizza-roll',
    date: '2026-05-26',
    homeTeam: 'Mount Sumit',
    awayTeam: 'Pick & Pizza Roll',
    homeScore: 67,
    awayScore: 81,
  },
  {
    id: '2026-05-26-ballers-united-united-splash-bros',
    date: '2026-05-26',
    homeTeam: 'Ballers United',
    awayTeam: 'United Splash Bros',
    homeScore: 72,
    awayScore: 63,
  },
  {
    id: '2026-05-26-amish-ballers-make-a-swish-foundation',
    date: '2026-05-26',
    homeTeam: 'Amish Ballers',
    awayTeam: 'Make a Swish Foundation',
    homeScore: 67,
    awayScore: 97,
  },
];

export const buildLeagueStandings = (results: LeagueGameResult[]): LeagueStanding[] => {
  const standings = new Map<string, LeagueStanding>();

  for (const result of results) {
    applyResult(standings, result.homeTeam, result.homeScore, result.awayScore);
    applyResult(standings, result.awayTeam, result.awayScore, result.homeScore);
  }

  return [...standings.values()].sort((left, right) => {
    if (right.winPct !== left.winPct) {
      return right.winPct - left.winPct;
    }

    if (right.pointDifferential !== left.pointDifferential) {
      return right.pointDifferential - left.pointDifferential;
    }

    if (right.pointsFor !== left.pointsFor) {
      return right.pointsFor - left.pointsFor;
    }

    return left.team.localeCompare(right.team);
  });
};

export const formatWinPct = (value: number): string => value.toFixed(3);

export const formatPointDifferential = (value: number): string =>
  value > 0 ? `+${value}` : `${value}`;

const applyResult = (
  standings: Map<string, LeagueStanding>,
  team: string,
  pointsFor: number,
  pointsAgainst: number,
) => {
  const standing = standings.get(team) ?? {
    team,
    wins: 0,
    losses: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    pointDifferential: 0,
    gamesPlayed: 0,
    winPct: 0,
  };

  standing.gamesPlayed += 1;
  standing.wins += pointsFor > pointsAgainst ? 1 : 0;
  standing.losses += pointsFor < pointsAgainst ? 1 : 0;
  standing.pointsFor += pointsFor;
  standing.pointsAgainst += pointsAgainst;
  standing.pointDifferential = standing.pointsFor - standing.pointsAgainst;
  standing.winPct = standing.gamesPlayed === 0 ? 0 : standing.wins / standing.gamesPlayed;

  standings.set(team, standing);
};
