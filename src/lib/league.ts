import type { LeagueGame } from '../types';
import { defaultSeason } from './seasons';

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

export const slugifyTeamName = (teamName: string): string =>
  teamName
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const getLeagueTeams = (games: LeagueGame[]): string[] =>
  [...new Set(games.flatMap((game) => [game.homeTeam, game.awayTeam]))].sort((left, right) =>
    left.localeCompare(right),
  );

export const findLeagueTeamBySlug = (games: LeagueGame[], teamSlug: string): string | null =>
  getLeagueTeams(games).find((team) => slugifyTeamName(team) === teamSlug) ?? null;

export const getTeamLeagueGames = (games: LeagueGame[], teamName: string): LeagueGame[] =>
  games.filter((game) => game.homeTeam === teamName || game.awayTeam === teamName);

export const leagueResults: LeagueGame[] = [
  {
    id: '2026-05-26-grape-soda-lamelos-balls',
    seasonId: defaultSeason.id,
    date: '2026-05-26',
    homeTeam: 'Grape Soda',
    awayTeam: "LaMelo's Balls",
    status: 'completed',
    homeScore: 73,
    awayScore: 87,
  },
  {
    id: '2026-05-26-mount-sumit-pick-pizza-roll',
    seasonId: defaultSeason.id,
    date: '2026-05-26',
    homeTeam: 'Mount Sumit',
    awayTeam: 'Pick & Pizza Roll',
    status: 'completed',
    homeScore: 67,
    awayScore: 81,
  },
  {
    id: '2026-05-26-ballers-united-united-splash-bros',
    seasonId: defaultSeason.id,
    date: '2026-05-26',
    homeTeam: 'Ballers United',
    awayTeam: 'United Splash Bros',
    status: 'completed',
    homeScore: 72,
    awayScore: 63,
  },
  {
    id: '2026-05-26-amish-ballers-make-a-swish-foundation',
    seasonId: defaultSeason.id,
    date: '2026-05-26',
    homeTeam: 'Amish Ballers',
    awayTeam: 'Make a Swish Foundation',
    status: 'completed',
    homeScore: 67,
    awayScore: 97,
  },
  {
    id: '2026-06-02-mount-sumit-make-a-swish-foundation',
    seasonId: defaultSeason.id,
    date: '2026-06-02',
    homeTeam: 'Mount Sumit',
    awayTeam: 'Make a Swish Foundation',
    status: 'completed',
    homeScore: 62,
    awayScore: 84,
  },
  {
    id: '2026-06-02-grape-soda-amish-ballers',
    seasonId: defaultSeason.id,
    date: '2026-06-02',
    homeTeam: 'Grape Soda',
    awayTeam: 'Amish Ballers',
    status: 'completed',
    homeScore: 79,
    awayScore: 77,
  },
  {
    id: '2026-06-02-ballers-united-lamelos-balls',
    seasonId: defaultSeason.id,
    date: '2026-06-02',
    homeTeam: 'Ballers United',
    awayTeam: "LaMelo's Balls",
    status: 'completed',
    homeScore: 81,
    awayScore: 71,
  },
  {
    id: '2026-06-02-pick-pizza-roll-united-splash-bros',
    seasonId: defaultSeason.id,
    date: '2026-06-02',
    homeTeam: 'Pick & Pizza Roll',
    awayTeam: 'United Splash Bros',
    status: 'completed',
    homeScore: 72,
    awayScore: 62,
  },
  {
    id: '2026-06-09-united-splash-bros-lamelos-balls',
    seasonId: defaultSeason.id,
    date: '2026-06-09',
    homeTeam: 'United Splash Bros',
    awayTeam: "LaMelo's Balls",
    status: 'completed',
    homeScore: 46,
    awayScore: 61,
  },
  {
    id: '2026-06-09-pick-pizza-roll-make-a-swish-foundation',
    seasonId: defaultSeason.id,
    date: '2026-06-09',
    homeTeam: 'Pick & Pizza Roll',
    awayTeam: 'Make a Swish Foundation',
    status: 'completed',
    homeScore: 65,
    awayScore: 83,
  },
  {
    id: '2026-06-09-amish-ballers-ballers-united',
    seasonId: defaultSeason.id,
    date: '2026-06-09',
    homeTeam: 'Amish Ballers',
    awayTeam: 'Ballers United',
    status: 'completed',
    homeScore: 90,
    awayScore: 88,
  },
  {
    id: '2026-06-09-mount-sumit-grape-soda',
    seasonId: defaultSeason.id,
    date: '2026-06-09',
    homeTeam: 'Mount Sumit',
    awayTeam: 'Grape Soda',
    status: 'completed',
    homeScore: 59,
    awayScore: 72,
  },
  {
    id: '2026-06-16-make-a-swish-foundation-united-splash-bros',
    seasonId: defaultSeason.id,
    date: '2026-06-16',
    homeTeam: 'Make a Swish Foundation',
    awayTeam: 'United Splash Bros',
    status: 'completed',
    homeScore: 94,
    awayScore: 89,
  },
  {
    id: '2026-06-16-ballers-united-mount-sumit',
    seasonId: defaultSeason.id,
    date: '2026-06-16',
    homeTeam: 'Ballers United',
    awayTeam: 'Mount Sumit',
    status: 'completed',
    homeScore: 68,
    awayScore: 61,
  },
  {
    id: '2026-06-16-lamelos-balls-amish-ballers',
    seasonId: defaultSeason.id,
    date: '2026-06-16',
    homeTeam: "LaMelo's Balls",
    awayTeam: 'Amish Ballers',
    status: 'completed',
    homeScore: 72,
    awayScore: 65,
  },
  {
    id: '2026-06-16-pick-pizza-roll-grape-soda',
    seasonId: defaultSeason.id,
    date: '2026-06-16',
    homeTeam: 'Pick & Pizza Roll',
    awayTeam: 'Grape Soda',
    status: 'completed',
    homeScore: 43,
    awayScore: 42,
  },
  {
    id: '2026-06-23-pick-pizza-roll-lamelos-balls',
    seasonId: defaultSeason.id,
    date: '2026-06-23',
    homeTeam: 'Pick & Pizza Roll',
    awayTeam: "LaMelo's Balls",
    status: 'completed',
    homeScore: 70,
    awayScore: 83,
  },
  {
    id: '2026-06-23-make-a-swish-foundation-grape-soda',
    seasonId: defaultSeason.id,
    date: '2026-06-23',
    homeTeam: 'Make a Swish Foundation',
    awayTeam: 'Grape Soda',
    status: 'completed',
    homeScore: 89,
    awayScore: 65,
  },
  {
    id: '2026-06-23-ballers-united-mount-sumit',
    seasonId: defaultSeason.id,
    date: '2026-06-23',
    homeTeam: 'Ballers United',
    awayTeam: 'Mount Sumit',
    status: 'completed',
    homeScore: 101,
    awayScore: 49,
  },
  {
    id: '2026-06-23-united-splash-bros-amish-ballers',
    seasonId: defaultSeason.id,
    date: '2026-06-23',
    homeTeam: 'United Splash Bros',
    awayTeam: 'Amish Ballers',
    status: 'completed',
    homeScore: 91,
    awayScore: 82,
  },
  {
    id: '2026-06-30-amish-ballers-mount-sumit',
    seasonId: defaultSeason.id,
    date: '2026-06-30',
    homeTeam: 'Amish Ballers',
    awayTeam: 'Mount Sumit',
    status: 'completed',
    homeScore: 97,
    awayScore: 80,
  },
  {
    id: '2026-06-30-lamelos-balls-pick-pizza-roll',
    seasonId: defaultSeason.id,
    date: '2026-06-30',
    homeTeam: "LaMelo's Balls",
    awayTeam: 'Pick & Pizza Roll',
    status: 'completed',
    homeScore: 63,
    awayScore: 86,
  },
  {
    id: '2026-06-30-grape-soda-united-splash-bros',
    seasonId: defaultSeason.id,
    date: '2026-06-30',
    homeTeam: 'Grape Soda',
    awayTeam: 'United Splash Bros',
    status: 'completed',
    homeScore: 66,
    awayScore: 74,
  },
  {
    id: '2026-06-30-make-a-swish-foundation-ballers-united',
    seasonId: defaultSeason.id,
    date: '2026-06-30',
    homeTeam: 'Make a Swish Foundation',
    awayTeam: 'Ballers United',
    status: 'completed',
    homeScore: 59,
    awayScore: 68,
  },
  {
    id: '2026-07-07-grape-soda-ballers-united',
    seasonId: defaultSeason.id,
    date: '2026-07-07',
    homeTeam: 'Grape Soda',
    awayTeam: 'Ballers United',
    status: 'scheduled',
  },
  {
    id: '2026-07-07-united-splash-bros-mount-sumit',
    seasonId: defaultSeason.id,
    date: '2026-07-07',
    homeTeam: 'United Splash Bros',
    awayTeam: 'Mount Sumit',
    status: 'scheduled',
  },
  {
    id: '2026-07-07-amish-ballers-pick-pizza-roll',
    seasonId: defaultSeason.id,
    date: '2026-07-07',
    homeTeam: 'Amish Ballers',
    awayTeam: 'Pick & Pizza Roll',
    status: 'scheduled',
  },
  {
    id: '2026-07-07-make-a-swish-foundation-lamelos-balls',
    seasonId: defaultSeason.id,
    date: '2026-07-07',
    homeTeam: 'Make a Swish Foundation',
    awayTeam: "LaMelo's Balls",
    status: 'scheduled',
  },
  {
    id: '2026-07-14-ballers-united-pick-pizza-roll',
    seasonId: defaultSeason.id,
    date: '2026-07-14',
    homeTeam: 'Ballers United',
    awayTeam: 'Pick & Pizza Roll',
    status: 'scheduled',
  },
  {
    id: '2026-07-14-amish-ballers-grape-soda',
    seasonId: defaultSeason.id,
    date: '2026-07-14',
    homeTeam: 'Amish Ballers',
    awayTeam: 'Grape Soda',
    status: 'scheduled',
  },
  {
    id: '2026-07-14-lamelos-balls-make-a-swish-foundation',
    seasonId: defaultSeason.id,
    date: '2026-07-14',
    homeTeam: "LaMelo's Balls",
    awayTeam: 'Make a Swish Foundation',
    status: 'scheduled',
  },
  {
    id: '2026-07-14-mount-sumit-united-splash-bros',
    seasonId: defaultSeason.id,
    date: '2026-07-14',
    homeTeam: 'Mount Sumit',
    awayTeam: 'United Splash Bros',
    status: 'scheduled',
  },
  {
    id: '2026-07-21-united-splash-bros-amish-ballers',
    seasonId: defaultSeason.id,
    date: '2026-07-21',
    homeTeam: 'United Splash Bros',
    awayTeam: 'Amish Ballers',
    status: 'scheduled',
  },
  {
    id: '2026-07-21-lamelos-balls-mount-sumit',
    seasonId: defaultSeason.id,
    date: '2026-07-21',
    homeTeam: "LaMelo's Balls",
    awayTeam: 'Mount Sumit',
    status: 'scheduled',
  },
  {
    id: '2026-07-21-pick-pizza-roll-make-a-swish-foundation',
    seasonId: defaultSeason.id,
    date: '2026-07-21',
    homeTeam: 'Pick & Pizza Roll',
    awayTeam: 'Make a Swish Foundation',
    status: 'scheduled',
  },
  {
    id: '2026-07-21-grape-soda-ballers-united',
    seasonId: defaultSeason.id,
    date: '2026-07-21',
    homeTeam: 'Grape Soda',
    awayTeam: 'Ballers United',
    status: 'scheduled',
  },
  {
    id: '2026-07-28-make-a-swish-foundation-grape-soda',
    seasonId: defaultSeason.id,
    date: '2026-07-28',
    homeTeam: 'Make a Swish Foundation',
    awayTeam: 'Grape Soda',
    status: 'scheduled',
  },
  {
    id: '2026-07-28-united-splash-bros-lamelos-balls',
    seasonId: defaultSeason.id,
    date: '2026-07-28',
    homeTeam: 'United Splash Bros',
    awayTeam: "LaMelo's Balls",
    status: 'scheduled',
  },
  {
    id: '2026-07-28-mount-sumit-amish-ballers',
    seasonId: defaultSeason.id,
    date: '2026-07-28',
    homeTeam: 'Mount Sumit',
    awayTeam: 'Amish Ballers',
    status: 'scheduled',
  },
  {
    id: '2026-07-28-ballers-united-pick-pizza-roll',
    seasonId: defaultSeason.id,
    date: '2026-07-28',
    homeTeam: 'Ballers United',
    awayTeam: 'Pick & Pizza Roll',
    status: 'scheduled',
  },
];

export const buildLeagueStandings = (results: LeagueGame[]): LeagueStanding[] => {
  const standings = new Map<string, LeagueStanding>();

  for (const result of results) {
    if (
      result.status !== 'completed'
      || typeof result.homeScore !== 'number'
      || typeof result.awayScore !== 'number'
    ) {
      continue;
    }

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
