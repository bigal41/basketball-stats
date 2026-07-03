import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import process from 'node:process';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { DEFAULT_SEASON_ID, defaultSeason } from '../src/lib/seasons';
import type { Game, LeagueGame, Player, PlayerGameStat, Season } from '../src/types';

interface SeedPayload {
  seasons?: Array<Season & { id: string }>;
  players: Array<Player & { id: string }>;
  games: Array<Game & { id: string }>;
  playerGameStats: PlayerGameStat[];
}

interface SeasonSeedPayload {
  seasons: Array<Season & { id: string }>;
}

interface PlayerSeedPayload {
  players: Array<Player & { id: string }>;
}

interface LeagueResultsSeedPayload {
  leagueGames: Array<LeagueGame & { id: string }>;
}

interface GameImportPayload {
  game: Omit<Game, 'id' | 'seasonId'> & { id?: string; seasonId?: string };
  playerStats: Array<{
    id?: string;
    playerName: string;
  } & Omit<PlayerGameStat, 'id' | 'playerId' | 'gameId'>>;
}

const cliArgs = process.argv.slice(2).filter((arg) => arg !== '--');
const seedFilePath = cliArgs[0] ?? 'data/seed.sample.json';
const serviceAccountPath = cliArgs[1] ?? 'firebase-service-account.json';

const loadJson = async <T>(filePath: string): Promise<T> => {
  const buffer = await readFile(filePath, 'utf8');
  return JSON.parse(buffer) as T;
};

type SeedInput =
  | SeedPayload
  | SeasonSeedPayload
  | PlayerSeedPayload
  | LeagueResultsSeedPayload
  | GameImportPayload;

const isSeedPayload = (payload: SeedInput): payload is SeedPayload =>
  'players' in payload && 'games' in payload && 'playerGameStats' in payload;

const isSeasonSeedPayload = (payload: SeedInput): payload is SeasonSeedPayload =>
  'seasons' in payload && !('players' in payload) && !('leagueGames' in payload) && !('game' in payload);

const isPlayerSeedPayload = (
  payload: SeedInput,
): payload is PlayerSeedPayload => 'players' in payload && !('games' in payload);

const isLeagueResultsSeedPayload = (payload: SeedInput): payload is LeagueResultsSeedPayload =>
  'leagueGames' in payload;

const main = async () => {
  const [serviceAccount, payload] = await Promise.all([
    loadJson<Record<string, unknown>>(serviceAccountPath),
    loadJson<SeedInput>(seedFilePath),
  ]);

  initializeApp({
    credential: cert(serviceAccount),
  });

  const db = getFirestore();

  if (isSeedPayload(payload)) {
    const seasons = payload.seasons ?? [defaultSeason];

    await Promise.all(
      seasons.map(({ id, ...season }) => db.collection('seasons').doc(id).set(season)),
    );

    await Promise.all(
      payload.players.map(({ id, ...player }) => db.collection('players').doc(id).set(player)),
    );

    await Promise.all(
      payload.games.map(({ id, seasonId, ...game }) =>
        db.collection('games').doc(id).set({ ...game, seasonId: seasonId ?? DEFAULT_SEASON_ID }),
      ),
    );

    await Promise.all(
      payload.playerGameStats.map(({ id, seasonId, ...stat }) =>
        db.collection('playerGameStats').doc(id).set({
          ...stat,
          seasonId: seasonId ?? DEFAULT_SEASON_ID,
        }),
      ),
    );

    console.log(
      `Seeded ${seasons.length} seasons, ${payload.players.length} players, ${payload.games.length} games, and ${payload.playerGameStats.length} player game stats.`,
    );
    return;
  }

  if (isSeasonSeedPayload(payload)) {
    await Promise.all(
      payload.seasons.map(({ id, ...season }) => db.collection('seasons').doc(id).set(season)),
    );

    console.log(`Seeded ${payload.seasons.length} seasons.`);
    return;
  }

  if (isPlayerSeedPayload(payload)) {
    await Promise.all(
      payload.players.map(({ id, ...player }) => db.collection('players').doc(id).set(player)),
    );

    console.log(`Seeded ${payload.players.length} players.`);
    return;
  }

  if (isLeagueResultsSeedPayload(payload)) {
    await Promise.all(
      payload.leagueGames.map(({ id, seasonId, ...leagueGame }) =>
        db.collection('leagueGames').doc(id).set({
          ...leagueGame,
          seasonId: seasonId ?? DEFAULT_SEASON_ID,
        }),
      ),
    );

    console.log(`Seeded ${payload.leagueGames.length} league games.`);
    return;
  }

  const playersSnapshot = await db.collection('players').get();
  const nameToPlayers = new Map<string, Array<{ id: string; name: string }>>();

  for (const playerDoc of playersSnapshot.docs) {
    const player = { id: playerDoc.id, name: String(playerDoc.get('name') ?? '').trim() };
    const key = normalizeName(player.name);
    const matches = nameToPlayers.get(key) ?? [];
    matches.push(player);
    nameToPlayers.set(key, matches);
  }

  const gameId = payload.game.id ?? randomUUID();
  const { id: _ignoredId, seasonId: gameSeasonId, ...gameData } = payload.game;

  await db.collection('games').doc(gameId).set({
    ...gameData,
    seasonId: gameSeasonId ?? DEFAULT_SEASON_ID,
  });

  const resolvedStats = payload.playerStats.map((stat) => {
    const key = normalizeName(stat.playerName);
    const matches = nameToPlayers.get(key) ?? [];

    if (matches.length === 0) {
      throw new Error(`No player found for name "${stat.playerName}". Add the player to the players collection first.`);
    }

    if (matches.length > 1) {
      throw new Error(`Duplicate player name match for "${stat.playerName}". Names must resolve to exactly one player.`);
    }

    const { id, playerName, seasonId: statSeasonId, ...statData } = stat;

    return {
      id: id ?? randomUUID(),
      seasonId: statSeasonId ?? gameSeasonId ?? DEFAULT_SEASON_ID,
      playerId: matches[0].id,
      gameId,
      ...statData,
    } satisfies PlayerGameStat;
  });

  await Promise.all(
    resolvedStats.map(({ id, ...stat }) => db.collection('playerGameStats').doc(id).set(stat)),
  );

  console.log(`Imported game ${gameId} with ${resolvedStats.length} player stat rows using player-name resolution.`);
};

const normalizeName = (name: string) => name.trim().toLowerCase();

void main();
