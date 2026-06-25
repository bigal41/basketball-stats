import process from 'node:process';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'node:fs/promises';
import { DEFAULT_SEASON_ID, defaultSeason } from '../src/lib/seasons';

const cliArgs = process.argv.slice(2).filter((arg) => arg !== '--');
const serviceAccountPath = cliArgs[0] ?? 'firebase-service-account.json';
const seasonId = cliArgs[1] ?? DEFAULT_SEASON_ID;

const loadJson = async <T>(filePath: string): Promise<T> =>
  JSON.parse(await readFile(filePath, 'utf8')) as T;

const main = async () => {
  const serviceAccount = await loadJson<Record<string, unknown>>(serviceAccountPath);

  initializeApp({
    credential: cert(serviceAccount),
  });

  const db = getFirestore();
  const season = seasonId === defaultSeason.id ? defaultSeason : {
    ...defaultSeason,
    id: seasonId,
    label: seasonId,
    isActive: false,
  };

  await db.collection('seasons').doc(season.id).set({
    label: season.label,
    year: season.year,
    kind: season.kind,
    isActive: season.isActive,
  }, { merge: true });

  const collections = ['games', 'playerGameStats', 'leagueGames'] as const;

  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).get();

    await Promise.all(
      snapshot.docs
        .filter((doc) => !doc.get('seasonId'))
        .map((doc) => doc.ref.set({ seasonId }, { merge: true })),
    );
  }

  console.log(`Backfilled missing seasonId values with "${seasonId}" and ensured the season exists.`);
};

void main();
