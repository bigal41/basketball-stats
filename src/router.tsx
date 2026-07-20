import { Suspense, lazy } from 'react';
import type { ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './ui/AppShell';
import { StatePanel } from './ui/StatePanel';

const DashboardPage = lazy(async () => {
  const module = await import('./pages/DashboardPage');
  return { default: module.DashboardPage };
});

const GamePage = lazy(async () => {
  const module = await import('./pages/GamePage');
  return { default: module.GamePage };
});

const PlayerPage = lazy(async () => {
  const module = await import('./pages/PlayerPage');
  return { default: module.PlayerPage };
});

const StandingsPage = lazy(async () => {
  const module = await import('./pages/StandingsPage');
  return { default: module.StandingsPage };
});

const TeamPage = lazy(async () => {
  const module = await import('./pages/TeamPage');
  return { default: module.TeamPage };
});

const NotFoundPage = lazy(async () => {
  const module = await import('./pages/NotFoundPage');
  return { default: module.NotFoundPage };
});

const withSuspense = (element: ReactNode) => (
  <Suspense fallback={<StatePanel title="Loading page" body="Rendering the next view." />}>
    {element}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: withSuspense(<DashboardPage />) },
      { path: 'games/:gameId', element: withSuspense(<GamePage />) },
      { path: 'players/:playerId', element: withSuspense(<PlayerPage />) },
      { path: 'standings', element: withSuspense(<StandingsPage />) },
      { path: 'teams/:teamSlug', element: withSuspense(<TeamPage />) },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
]);
