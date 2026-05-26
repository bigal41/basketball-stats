export type GameStatus = 'scheduled' | 'completed';
export type GameType = 'preseason' | 'regular' | 'playoff';

export interface Game {
  id: string;
  date: string;
  opponent: string;
  teamScore?: number;
  oppScore?: number;
  status: GameStatus;
  gameType?: GameType;
  youtubeUrl?: string;
}

export interface Player {
  id: string;
  name: string;
}

export interface PlayerGameStat {
  id: string;
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
  games: Game[];
  players: Player[];
  playerGameStats: PlayerGameStat[];
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
