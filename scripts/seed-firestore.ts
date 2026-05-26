import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import process from 'node:process';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { Game, Player, PlayerGameStat } from '../src/types';

interface SeedPayload {
  players: Array<Player & { id: string }>;
  games: Array<Game & { id: string }>;
  playerGameStats: PlayerGameStat[];
}

interface GameImportPayload {
  game: Omit<Game, 'id'> & { id?: string };
  playerStats: Array<{
    id?: string;
    playerName: string;
  } & Omit<PlayerGameStat, 'id' | 'playerId' | 'gameId'>>;
}

const seedFilePath = process.argv[2] ?? 'data/seed.sample.json';
const serviceAccountPath = process.argv[3] ?? 'firebase-service-account.json';

const loadJson = async <T>(filePath: string): Promise<T> => {
  const buffer = await readFile(filePath, 'utf8');
  return JSON.parse(buffer) as T;
};

const isSeedPayload = (payload: SeedPayload | GameImportPayload): payload is SeedPayload =>
  'players' in payload && 'games' in payload && 'playerGameStats' in payload;

const main = async () => {
  const [serviceAccount, payload] = await Promise.all([
    loadJson<Record<string, unknown>>(serviceAccountPath),
    loadJson<SeedPayload | GameImportPayload>(seedFilePath),
  ]);

  initializeApp({
    credential: cert(serviceAccount),
  });

  const db = getFirestore();

  if (isSeedPayload(payload)) {
    await Promise.all(
      payload.players.map((player) => db.collection('players').doc(player.id).set({ name: player.name })),
    );

    await Promise.all(
      payload.games.map(({ id, ...game }) => db.collection('games').doc(id).set(game)),
    );

    await Promise.all(
      payload.playerGameStats.map(({ id, ...stat }) =>
        db.collection('playerGameStats').doc(id).set(stat),
      ),
    );

    console.log(
      `Seeded ${payload.players.length} players, ${payload.games.length} games, and ${payload.playerGameStats.length} player game stats.`,
    );
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
  const { id: _ignoredId, ...gameData } = payload.game;

  await db.collection('games').doc(gameId).set(gameData);

  const resolvedStats = payload.playerStats.map((stat) => {
    const key = normalizeName(stat.playerName);
    const matches = nameToPlayers.get(key) ?? [];

    if (matches.length === 0) {
      throw new Error(`No player found for name "${stat.playerName}". Add the player to the players collection first.`);
    }

    if (matches.length > 1) {
      throw new Error(`Duplicate player name match for "${stat.playerName}". Names must resolve to exactly one player.`);
    }

    const { id, playerName, ...statData } = stat;

    return {
      id: id ?? randomUUID(),
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
