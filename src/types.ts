export type GameStatus = 'scheduled' | 'completed';
export type GameType = 'preseason' | 'regular' | 'playoff';
export type SeasonKind = 'summer' | 'winter' | 'fall' | 'spring' | 'custom';

export interface Season {
  id: string;
  label: string;
  year: number;
  kind: SeasonKind;
  isActive: boolean;
}

export interface GameVideoLink {
  label: string;
  url: string;
}

export interface LeagueGameResult {
  id: string;
  seasonId: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
}

export interface Game {
  id: string;
  seasonId: string;
  date: string;
  opponent: string;
  teamScore?: number;
  oppScore?: number;
  status: GameStatus;
  gameType?: GameType;
  youtubeUrl?: string;
  youtubeUrls?: GameVideoLink[];
  absentPlayerNames?: string[];
}

export interface Player {
  id: string;
  name: string;
  sub?: boolean;
}

export interface PlayerGameStat {
  id: string;
  seasonId: string;
  playerId: string;
  gameId: string;
  pts: number;
  reb: number;
  ast: number;
  fgm: number;
  fga: number;
  tpm: number;
  tpa: number;
  stl: number;
  blk: number;
}

export interface SeasonData {
  season: Season;
  games: Game[];
  players: Player[];
  playerGameStats: PlayerGameStat[];
}

export interface TeamEloRating {
  team: string;
  rating: number;
  gamesProcessed: number;
  lastUpdated: string | null;
}

export interface EloTimelineEntry {
  resultId: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamPreRating: number;
  awayTeamPreRating: number;
  homeTeamPostRating: number;
  awayTeamPostRating: number;
}

export interface GameProjection {
  gameId: string;
  date: string;
  opponent: string;
  teamElo: number;
  opponentElo: number;
  winProbability: number;
  projectedSpread: number;
}

export interface DashboardData extends SeasonData {
  currentRatingsByTeam: Record<string, TeamEloRating>;
  ratingTimeline: EloTimelineEntry[];
  futureGameProjections: GameProjection[];
}

export interface StatLine {
  pts: number;
  reb: number;
  ast: number;
  fgm: number;
  fga: number;
  tpm: number;
  tpa: number;
  stl: number;
  blk: number;
}
