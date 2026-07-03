import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore/lite';
import { db, hasFirebaseConfig } from './firebase';
import {
  asCompletedLeagueGameResults,
  buildEloRatings,
  buildFutureGameProjections,
  buildFutureLeagueGameProjections,
} from './elo';
import { leagueResults } from './league';
import { sampleData } from './sampleData';
import { DEFAULT_SEASON_ID, defaultSeason } from './seasons';
import type {
  DashboardData,
  Game,
  LeagueGame,
  Season,
  Player,
  PlayerGameStat,
  SeasonData,
} from '../types';

const sortByDate = (games: Game[]) => [...games].sort((a, b) => a.date.localeCompare(b.date));

const withSeasonId = <T extends object>(record: T, seasonId: string): T & { seasonId: string } => ({
  ...record,
  seasonId: (record as { seasonId?: string }).seasonId ?? seasonId,
});

export const getSeasonData = async (): Promise<SeasonData> => {
  if (!hasFirebaseConfig || !db) {
    return sampleData;
  }

  const activeSeason = await getActiveSeason();
  const [gamesSnapshot, playersSnapshot, statsSnapshot] = await Promise.all([
    getDocs(query(collection(db, 'games'), where('seasonId', '==', activeSeason.id), orderBy('date', 'asc'))),
    getDocs(collection(db, 'players')),
    getDocs(query(collection(db, 'playerGameStats'), where('seasonId', '==', activeSeason.id))),
  ]);

  const scopedGames = gamesSnapshot.docs.map((doc) => withSeasonId({
    id: doc.id,
    ...doc.data(),
  }, activeSeason.id)) as Game[];
  const players = playersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Player[];
  const scopedPlayerGameStats = statsSnapshot.docs.map((doc) => withSeasonId({
    id: doc.id,
    ...doc.data(),
  }, activeSeason.id)) as PlayerGameStat[];

  if (scopedGames.length > 0 || scopedPlayerGameStats.length > 0) {
    return {
      season: activeSeason,
      games: sortByDate(scopedGames),
      players,
      playerGameStats: scopedPlayerGameStats,
    };
  }

  const [legacyGamesSnapshot, legacyStatsSnapshot] = await Promise.all([
    getDocs(query(collection(db, 'games'), orderBy('date', 'asc'))),
    getDocs(collection(db, 'playerGameStats')),
  ]);

  const games = legacyGamesSnapshot.docs.map((doc) => withSeasonId({
    id: doc.id,
    ...doc.data(),
  }, activeSeason.id)) as Game[];
  const playerGameStats = legacyStatsSnapshot.docs.map((doc) => withSeasonId({
    id: doc.id,
    ...doc.data(),
  }, activeSeason.id)) as PlayerGameStat[];

  return {
    season: activeSeason,
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

  const activeSeason = await getActiveSeason();
  const scopedStatsSnapshot = await getDocs(
    query(
      collection(db, 'playerGameStats'),
      where('seasonId', '==', activeSeason.id),
      where('gameId', '==', gameId),
    ),
  );

  if (scopedStatsSnapshot.docs.length > 0) {
    return scopedStatsSnapshot.docs.map((doc) => withSeasonId({
      id: doc.id,
      ...doc.data(),
    }, activeSeason.id)) as PlayerGameStat[];
  }

  const legacyStatsSnapshot = await getDocs(
    query(collection(db, 'playerGameStats'), where('gameId', '==', gameId)),
  );

  return legacyStatsSnapshot.docs.map((doc) => withSeasonId({
    id: doc.id,
    ...doc.data(),
  }, activeSeason.id)) as PlayerGameStat[];
};

export const getPlayerById = async (playerId: string): Promise<Player | null> => {
  const seasonData = await getSeasonData();
  return seasonData.players.find((player) => player.id === playerId) ?? null;
};

export const getStatsByPlayerId = async (playerId: string): Promise<PlayerGameStat[]> => {
  if (!hasFirebaseConfig || !db) {
    return sampleData.playerGameStats.filter((stat) => stat.playerId === playerId);
  }

  const activeSeason = await getActiveSeason();
  const scopedStatsSnapshot = await getDocs(
    query(
      collection(db, 'playerGameStats'),
      where('seasonId', '==', activeSeason.id),
      where('playerId', '==', playerId),
    ),
  );

  if (scopedStatsSnapshot.docs.length > 0) {
    return scopedStatsSnapshot.docs.map((doc) => withSeasonId({
      id: doc.id,
      ...doc.data(),
    }, activeSeason.id)) as PlayerGameStat[];
  }

  const legacyStatsSnapshot = await getDocs(
    query(collection(db, 'playerGameStats'), where('playerId', '==', playerId)),
  );

  return legacyStatsSnapshot.docs.map((doc) => withSeasonId({
    id: doc.id,
    ...doc.data(),
  }, activeSeason.id)) as PlayerGameStat[];
};

const withLeagueGameDefaults = (game: LeagueGame): LeagueGame => ({
  ...game,
  status: game.status ?? 'completed',
});

export const getLeagueGames = async (): Promise<LeagueGame[]> => {
  if (!hasFirebaseConfig || !db) {
    return leagueResults;
  }

  const activeSeason = await getActiveSeason();
  const scopedLeagueGamesSnapshot = await getDocs(
    query(
      collection(db, 'leagueGames'),
      where('seasonId', '==', activeSeason.id),
      orderBy('date', 'asc'),
    ),
  );

  if (scopedLeagueGamesSnapshot.docs.length > 0) {
    return scopedLeagueGamesSnapshot.docs.map((doc) => withLeagueGameDefaults(withSeasonId({
      id: doc.id,
      ...doc.data(),
    }, activeSeason.id) as LeagueGame));
  }

  const legacyLeagueGamesSnapshot = await getDocs(
    query(collection(db, 'leagueGames'), orderBy('date', 'asc')),
  );

  return legacyLeagueGamesSnapshot.docs.map((doc) => withLeagueGameDefaults(withSeasonId({
    id: doc.id,
    ...doc.data(),
  }, activeSeason.id) as LeagueGame));
};

export const getDashboardData = async (): Promise<DashboardData> => {
  const [seasonData, leagueGames] = await Promise.all([getSeasonData(), getLeagueGames()]);
  const completedResults = asCompletedLeagueGameResults(leagueGames);
  const { currentRatingsByTeam, ratingTimeline } = buildEloRatings(completedResults);
  const futureGameProjections = buildFutureGameProjections(seasonData.games, currentRatingsByTeam);
  const futureLeagueGameProjections = buildFutureLeagueGameProjections(leagueGames, currentRatingsByTeam);

  return {
    ...seasonData,
    leagueGames,
    currentRatingsByTeam,
    ratingTimeline,
    futureGameProjections,
    futureLeagueGameProjections,
  };
};

export const getActiveSeason = async (): Promise<Season> => {
  if (!hasFirebaseConfig || !db) {
    return defaultSeason;
  }

  const activeSeasonSnapshot = await getDocs(
    query(collection(db, 'seasons'), where('isActive', '==', true), limit(1)),
  );

  const activeSeasonDoc = activeSeasonSnapshot.docs[0];

  if (!activeSeasonDoc) {
    return defaultSeason;
  }

  return {
    id: activeSeasonDoc.id,
    ...activeSeasonDoc.data(),
  } as Season;
};

export const getDefaultSeasonId = (): string => DEFAULT_SEASON_ID;
