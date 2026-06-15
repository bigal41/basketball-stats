# Basketball Stats

Single-team basketball dashboard built with React, Vite, TypeScript, Tailwind, Firebase, and Netlify.

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create `.env.local`:

   ```bash
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

3. Run locally:

   ```bash
   pnpm run dev
   ```

If Firebase env vars are missing, the app falls back to local sample data so the UI still works.

## Firestore Collections

- `games`
- `players`
- `playerGameStats`
- `leagueGames`

`games` documents support the schedule/result fields used by the app and can optionally include `youtubeUrl`, `youtubeUrls`, or `absentPlayerNames` for estimated-stat exclusions on specific games.
`players` documents support the player profile fields used by the app and seed scripts, including optional flags like `sub`.
`leagueGames` documents support team-level league results used by the standings page.

## Seed Workflow

1. Use one of these input formats:
   - `data/seed.sample.json` for full bootstrap seeding with explicit UUIDs
   - `data/game-import.sample.json` for adding one game using `playerName` instead of `playerId`
2. Add a Firebase service account JSON at `firebase-service-account.json`.
3. Run:

   ```bash
   pnpm run seed -- data/seed.sample.json
   ```

For one-game imports, run:

```bash
pnpm run seed -- data/game-import.sample.json
```

Importer behavior:
- full seed files overwrite matching UUID document ids for `games`, `players`, and `playerGameStats`
- game import files generate a new `gameId` when one is not provided
- game import files resolve `playerName` against the existing `players` collection in Firestore
- unknown player names fail
- duplicate player name matches fail
