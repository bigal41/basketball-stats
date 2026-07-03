import type {
  EloTimelineEntry,
  Game,
  GameProjection,
  LeagueGame,
  LeagueGameProjection,
  LeagueGameResult,
  TeamEloRating,
} from '../types';

export const BALLERS_UNITED_TEAM_NAME = 'Ballers United';
export const ELO_INITIAL_RATING = 1200;
export const ELO_K_FACTOR = 24;
export const ELO_DIVISOR = 400;
export const ELO_SPREAD_DIVISOR = 28;

export interface EloComputation {
  currentRatingsByTeam: Record<string, TeamEloRating>;
  ratingTimeline: EloTimelineEntry[];
}

export const normalizeTeamName = (teamName: string): string =>
  teamName.replace(/^#\d+\s*-\s*/, '').trim();

export const getTodayIsoDate = (): string => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
};

export const calculateExpectedScore = (teamRating: number, opponentRating: number): number =>
  1 / (1 + 10 ** ((opponentRating - teamRating) / ELO_DIVISOR));

export const buildEloRatings = (results: LeagueGameResult[]): EloComputation => {
  const sortedResults = [...results].sort((left, right) =>
    left.date === right.date ? left.id.localeCompare(right.id) : left.date.localeCompare(right.date),
  );
  const ratings = new Map<string, TeamEloRating>();
  const ratingTimeline: EloTimelineEntry[] = [];

  for (const result of sortedResults) {
    const homeRating = getTeamRating(ratings, result.homeTeam);
    const awayRating = getTeamRating(ratings, result.awayTeam);
    const expectedHomeScore = calculateExpectedScore(homeRating.rating, awayRating.rating);
    const expectedAwayScore = calculateExpectedScore(awayRating.rating, homeRating.rating);
    const actualHomeScore = result.homeScore === result.awayScore ? 0.5 : result.homeScore > result.awayScore ? 1 : 0;
    const actualAwayScore = 1 - actualHomeScore;
    const homeTeamPostRating = homeRating.rating + ELO_K_FACTOR * (actualHomeScore - expectedHomeScore);
    const awayTeamPostRating = awayRating.rating + ELO_K_FACTOR * (actualAwayScore - expectedAwayScore);

    ratings.set(result.homeTeam, {
      team: result.homeTeam,
      rating: homeTeamPostRating,
      gamesProcessed: homeRating.gamesProcessed + 1,
      lastUpdated: result.date,
    });
    ratings.set(result.awayTeam, {
      team: result.awayTeam,
      rating: awayTeamPostRating,
      gamesProcessed: awayRating.gamesProcessed + 1,
      lastUpdated: result.date,
    });

    ratingTimeline.push({
      resultId: result.id,
      date: result.date,
      homeTeam: result.homeTeam,
      awayTeam: result.awayTeam,
      homeTeamPreRating: homeRating.rating,
      awayTeamPreRating: awayRating.rating,
      homeTeamPostRating,
      awayTeamPostRating,
    });
  }

  return {
    currentRatingsByTeam: Object.fromEntries(
      [...ratings.values()].map((rating) => [rating.team, rating]),
    ),
    ratingTimeline,
  };
};

export const asCompletedLeagueGameResults = (games: LeagueGame[]): LeagueGameResult[] =>
  games.filter((game): game is LeagueGameResult =>
    game.status === 'completed'
    && typeof game.homeScore === 'number'
    && typeof game.awayScore === 'number',
  );

export const buildFutureGameProjections = (
  games: Game[],
  currentRatingsByTeam: Record<string, TeamEloRating>,
  options?: {
    asOfDate?: string;
    teamName?: string;
  },
): GameProjection[] => {
  const asOfDate = options?.asOfDate ?? getTodayIsoDate();
  const teamName = options?.teamName ?? BALLERS_UNITED_TEAM_NAME;
  const teamRating = currentRatingsByTeam[teamName]?.rating ?? ELO_INITIAL_RATING;

  return games
    .filter((game) => game.status !== 'completed' && game.date >= asOfDate)
    .sort((left, right) => left.date.localeCompare(right.date))
    .map((game) => {
      const normalizedOpponent = normalizeTeamName(game.opponent);
      const opponentRating = currentRatingsByTeam[normalizedOpponent]?.rating ?? ELO_INITIAL_RATING;
      const winProbability = calculateExpectedScore(teamRating, opponentRating);
      const projectedSpread = roundToNearestHalf((opponentRating - teamRating) / ELO_SPREAD_DIVISOR);

      return {
        gameId: game.id,
        date: game.date,
        opponent: game.opponent,
        teamElo: teamRating,
        opponentElo: opponentRating,
        winProbability,
        projectedSpread,
      };
    });
};

export const buildFutureLeagueGameProjections = (
  games: LeagueGame[],
  currentRatingsByTeam: Record<string, TeamEloRating>,
  options?: {
    asOfDate?: string;
  },
): LeagueGameProjection[] => {
  const asOfDate = options?.asOfDate ?? getTodayIsoDate();

  return games
    .filter((game) => game.status !== 'completed' && game.date >= asOfDate)
    .sort((left, right) => left.date === right.date ? left.id.localeCompare(right.id) : left.date.localeCompare(right.date))
    .map((game) => {
      const homeTeamElo = currentRatingsByTeam[game.homeTeam]?.rating ?? ELO_INITIAL_RATING;
      const awayTeamElo = currentRatingsByTeam[game.awayTeam]?.rating ?? ELO_INITIAL_RATING;
      const homeWinProbability = calculateExpectedScore(homeTeamElo, awayTeamElo);

      return {
        gameId: game.id,
        date: game.date,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        homeTeamElo,
        awayTeamElo,
        homeWinProbability,
        awayWinProbability: 1 - homeWinProbability,
      };
    });
};

const getTeamRating = (
  ratings: Map<string, TeamEloRating>,
  teamName: string,
): TeamEloRating =>
  ratings.get(teamName) ?? {
    team: teamName,
    rating: ELO_INITIAL_RATING,
    gamesProcessed: 0,
    lastUpdated: null,
  };

const roundToNearestHalf = (value: number): number => Math.round(value * 2) / 2;
