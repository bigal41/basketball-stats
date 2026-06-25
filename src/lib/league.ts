import type { LeagueGameResult } from '../types';
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

export const leagueResults: LeagueGameResult[] = [
  {
    id: '2026-05-26-grape-soda-lamelos-balls',
    seasonId: defaultSeason.id,
    date: '2026-05-26',
    homeTeam: 'Grape Soda',
    awayTeam: "LaMelo's Balls",
    homeScore: 73,
    awayScore: 87,
  },
  {
    id: '2026-05-26-mount-sumit-pick-pizza-roll',
    seasonId: defaultSeason.id,
    date: '2026-05-26',
    homeTeam: 'Mount Sumit',
    awayTeam: 'Pick & Pizza Roll',
    homeScore: 67,
    awayScore: 81,
  },
  {
    id: '2026-05-26-ballers-united-united-splash-bros',
    seasonId: defaultSeason.id,
    date: '2026-05-26',
    homeTeam: 'Ballers United',
    awayTeam: 'United Splash Bros',
    homeScore: 72,
    awayScore: 63,
  },
  {
    id: '2026-05-26-amish-ballers-make-a-swish-foundation',
    seasonId: defaultSeason.id,
    date: '2026-05-26',
    homeTeam: 'Amish Ballers',
    awayTeam: 'Make a Swish Foundation',
    homeScore: 67,
    awayScore: 97,
  },
  {
    id: '2026-06-02-mount-sumit-make-a-swish-foundation',
    seasonId: defaultSeason.id,
    date: '2026-06-02',
    homeTeam: 'Mount Sumit',
    awayTeam: 'Make a Swish Foundation',
    homeScore: 62,
    awayScore: 84,
  },
  {
    id: '2026-06-02-grape-soda-amish-ballers',
    seasonId: defaultSeason.id,
    date: '2026-06-02',
    homeTeam: 'Grape Soda',
    awayTeam: 'Amish Ballers',
    homeScore: 79,
    awayScore: 77,
  },
  {
    id: '2026-06-02-ballers-united-lamelos-balls',
    seasonId: defaultSeason.id,
    date: '2026-06-02',
    homeTeam: 'Ballers United',
    awayTeam: "LaMelo's Balls",
    homeScore: 81,
    awayScore: 71,
  },
  {
    id: '2026-06-02-pick-pizza-roll-united-splash-bros',
    seasonId: defaultSeason.id,
    date: '2026-06-02',
    homeTeam: 'Pick & Pizza Roll',
    awayTeam: 'United Splash Bros',
    homeScore: 72,
    awayScore: 62,
  },
  {
    id: '2026-06-09-united-splash-bros-lamelos-balls',
    seasonId: defaultSeason.id,
    date: '2026-06-09',
    homeTeam: 'United Splash Bros',
    awayTeam: "LaMelo's Balls",
    homeScore: 46,
    awayScore: 61,
  },
  {
    id: '2026-06-09-pick-pizza-roll-make-a-swish-foundation',
    seasonId: defaultSeason.id,
    date: '2026-06-09',
    homeTeam: 'Pick & Pizza Roll',
    awayTeam: 'Make a Swish Foundation',
    homeScore: 65,
    awayScore: 83,
  },
  {
    id: '2026-06-09-amish-ballers-ballers-united',
    seasonId: defaultSeason.id,
    date: '2026-06-09',
    homeTeam: 'Amish Ballers',
    awayTeam: 'Ballers United',
    homeScore: 90,
    awayScore: 88,
  },
  {
    id: '2026-06-09-mount-sumit-grape-soda',
    seasonId: defaultSeason.id,
    date: '2026-06-09',
    homeTeam: 'Mount Sumit',
    awayTeam: 'Grape Soda',
    homeScore: 59,
    awayScore: 72,
  },
  {
    id: '2026-06-16-make-a-swish-foundation-united-splash-bros',
    seasonId: defaultSeason.id,
    date: '2026-06-16',
    homeTeam: 'Make a Swish Foundation',
    awayTeam: 'United Splash Bros',
    homeScore: 94,
    awayScore: 89,
  },
  {
    id: '2026-06-16-ballers-united-mount-sumit',
    seasonId: defaultSeason.id,
    date: '2026-06-16',
    homeTeam: 'Ballers United',
    awayTeam: 'Mount Sumit',
    homeScore: 68,
    awayScore: 61,
  },
  {
    id: '2026-06-16-lamelos-balls-amish-ballers',
    seasonId: defaultSeason.id,
    date: '2026-06-16',
    homeTeam: "LaMelo's Balls",
    awayTeam: 'Amish Ballers',
    homeScore: 72,
    awayScore: 65,
  },
  {
    id: '2026-06-16-pick-pizza-roll-grape-soda',
    seasonId: defaultSeason.id,
    date: '2026-06-16',
    homeTeam: 'Pick & Pizza Roll',
    awayTeam: 'Grape Soda',
    homeScore: 43,
    awayScore: 42,
  },
  {
    id: '2026-06-23-pick-pizza-roll-lamelos-balls',
    seasonId: defaultSeason.id,
    date: '2026-06-23',
    homeTeam: 'Pick & Pizza Roll',
    awayTeam: "LaMelo's Balls",
    homeScore: 70,
    awayScore: 83,
  },
  {
    id: '2026-06-23-make-a-swish-foundation-grape-soda',
    seasonId: defaultSeason.id,
    date: '2026-06-23',
    homeTeam: 'Make a Swish Foundation',
    awayTeam: 'Grape Soda',
    homeScore: 89,
    awayScore: 65,
  },
  {
    id: '2026-06-23-ballers-united-mount-sumit',
    seasonId: defaultSeason.id,
    date: '2026-06-23',
    homeTeam: 'Ballers United',
    awayTeam: 'Mount Sumit',
    homeScore: 101,
    awayScore: 49,
  },
  {
    id: '2026-06-23-united-splash-bros-amish-ballers',
    seasonId: defaultSeason.id,
    date: '2026-06-23',
    homeTeam: 'United Splash Bros',
    awayTeam: 'Amish Ballers',
    homeScore: 91,
    awayScore: 82,
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
