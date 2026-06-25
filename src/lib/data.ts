import { collection, getDocs, orderBy, query, where } from 'firebase/firestore/lite';
import { db, hasFirebaseConfig } from './firebase';
import { buildEloRatings, buildFutureGameProjections } from './elo';
import { leagueResults } from './league';
import { sampleData } from './sampleData';
import type {
  DashboardData,
  Game,
  LeagueGameResult,
  Player,
  PlayerGameStat,
  SeasonData,
} from '../types';

const sortByDate = (games: Game[]) => [...games].sort((a, b) => a.date.localeCompare(b.date));

export const getSeasonData = async (): Promise<SeasonData> => {
  if (!hasFirebaseConfig || !db) {
    return sampleData;
  }

  const [gamesSnapshot, playersSnapshot, statsSnapshot] = await Promise.all([
    getDocs(query(collection(db, 'games'), orderBy('date', 'asc'))),
    getDocs(collection(db, 'players')),
    getDocs(collection(db, 'playerGameStats')),
  ]);

  const games = gamesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Game[];
  const players = playersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Player[];
  const playerGameStats = statsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as PlayerGameStat[];

  return {
    games: sortByDate(games),
    players,
    playerGameStats,
  };
};

export const getGameById = async (gameId: string): Promise<Game | null> => {
  const seasonData = await getSeasonData();
  return seasonData.games.find((game) => game.id === gameId) ?? null;
};

export const getStatsByGameId = async (gameId: string): Promise<PlayerGameStat[]> => {
  if (!hasFirebaseConfig || !db) {
    return sampleData.playerGameStats.filter((stat) => stat.gameId === gameId);
  }

  const statsSnapshot = await getDocs(
    query(collection(db, 'playerGameStats'), where('gameId', '==', gameId)),
  );

  return statsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as PlayerGameStat[];
};

export const getPlayerById = async (playerId: string): Promise<Player | null> => {
  const seasonData = await getSeasonData();
  return seasonData.players.find((player) => player.id === playerId) ?? null;
};

export const getStatsByPlayerId = async (playerId: string): Promise<PlayerGameStat[]> => {
  if (!hasFirebaseConfig || !db) {
    return sampleData.playerGameStats.filter((stat) => stat.playerId === playerId);
  }

  const statsSnapshot = await getDocs(
    query(collection(db, 'playerGameStats'), where('playerId', '==', playerId)),
  );

  return statsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as PlayerGameStat[];
};

export const getLeagueResults = async (): Promise<LeagueGameResult[]> => {
  if (!hasFirebaseConfig || !db) {
    return leagueResults;
  }

  const leagueGamesSnapshot = await getDocs(
    query(collection(db, 'leagueGames'), orderBy('date', 'asc')),
  );

  return leagueGamesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as LeagueGameResult[];
};

export const getDashboardData = async (): Promise<DashboardData> => {
  const [seasonData, results] = await Promise.all([getSeasonData(), getLeagueResults()]);
  const { currentRatingsByTeam, ratingTimeline } = buildEloRatings(results);
  const futureGameProjections = buildFutureGameProjections(seasonData.games, currentRatingsByTeam);

  return {
    ...seasonData,
    currentRatingsByTeam,
    ratingTimeline,
    futureGameProjections,
  };
};
