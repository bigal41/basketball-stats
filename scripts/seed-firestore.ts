import { readFile } from 'node:fs/promises';
import process from 'node:process';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { Game, Player, PlayerGameStat } from '../src/types';

interface SeedPayload {
  players: Array<Player & { id: string }>;
  games: Array<Game & { id: string }>;
  playerGameStats: PlayerGameStat[];
}

const seedFilePath = process.argv[2] ?? 'data/seed.sample.json';
const serviceAccountPath = process.argv[3] ?? 'firebase-service-account.json';

const loadJson = async <T>(filePath: string): Promise<T> => {
  const buffer = await readFile(filePath, 'utf8');
  return JSON.parse(buffer) as T;
};

const main = async () => {
  const [serviceAccount, payload] = await Promise.all([
    loadJson<Record<string, unknown>>(serviceAccountPath),
    loadJson<SeedPayload>(seedFilePath),
  ]);

  initializeApp({
    credential: cert(serviceAccount),
  });

  const db = getFirestore();

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
};

void main();
