# Basketball Stats

Single-team basketball dashboard built with React, Vite, TypeScript, Tailwind, Firebase, and Netlify.

## Setup

1. Install dependencies:

   ```bash
   npm install
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
   npm run dev
   ```

If Firebase env vars are missing, the app falls back to local sample data so the UI still works.

## Firestore Collections

- `games`
- `players`
- `playerGameStats`

`games` documents support the schedule/result fields used by the app and can optionally include `youtubeUrl` for recorded games.

## Seed Workflow

1. Copy `data/seed.sample.json` to your own JSON file if needed.
2. Add a Firebase service account JSON at `firebase-service-account.json`.
3. Run:

   ```bash
   npm run seed -- data/seed.sample.json
   ```

The script overwrites matching UUID document ids for `games`, `players`, and `playerGameStats`.
