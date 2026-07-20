import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { TeamPage } from './TeamPage';
import type { DashboardData } from '../types';
import { defaultSeason } from '../lib/seasons';

vi.mock('../hooks/useDashboardData', () => ({
  useDashboardData: vi.fn(),
}));

vi.mock('../ui/LazyCharts', () => ({
  DeferredTeamTrendChart: () => <div>Trend Chart</div>,
}));

const { useDashboardData } = await import('../hooks/useDashboardData');

const baseData: DashboardData = {
  season: defaultSeason,
  games: [],
  players: [],
  playerGameStats: [],
  leagueGames: [
    {
      id: 'g1',
      seasonId: defaultSeason.id,
      date: '2026-07-14',
      homeTeam: 'Pick & Pizza Roll',
      awayTeam: 'Ballers United',
      status: 'completed',
      homeScore: 61,
      awayScore: 68,
    },
    {
      id: 'g2',
      seasonId: defaultSeason.id,
      date: '2026-07-21',
      homeTeam: 'Pick & Pizza Roll',
      awayTeam: 'Make a Swish Foundation',
      status: 'scheduled',
    },
  ],
  currentRatingsByTeam: {
    'Pick & Pizza Roll': { team: 'Pick & Pizza Roll', rating: 1224, gamesProcessed: 1, lastUpdated: '2026-07-14' },
    'Ballers United': { team: 'Ballers United', rating: 1212, gamesProcessed: 1, lastUpdated: '2026-07-14' },
    'Make a Swish Foundation': { team: 'Make a Swish Foundation', rating: 1188, gamesProcessed: 0, lastUpdated: null },
  },
  ratingTimeline: [],
  futureGameProjections: [],
  futureLeagueGameProjections: [
    {
      gameId: 'g2',
      date: '2026-07-21',
      homeTeam: 'Pick & Pizza Roll',
      awayTeam: 'Make a Swish Foundation',
      homeTeamElo: 1224,
      awayTeamElo: 1188,
      homeWinProbability: 0.551,
      awayWinProbability: 0.449,
    },
  ],
};

describe('TeamPage', () => {
  it('renders a polished team summary with results and projections', () => {
    vi.mocked(useDashboardData).mockReturnValue({
      data: baseData,
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={['/teams/pick-and-pizza-roll']}>
        <Routes>
          <Route path="/teams/:teamSlug" element={<TeamPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Pick & Pizza Roll')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Outlook')).toBeInTheDocument();
    expect(screen.getByText('55.1%')).toBeInTheDocument();
    expect(screen.getByText('Trend Chart')).toBeInTheDocument();
    expect(screen.getByText('61 - 68')).toBeInTheDocument();
  });
});
