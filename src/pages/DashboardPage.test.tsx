import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { DashboardPage } from './DashboardPage';
import type { DashboardData } from '../types';
import { defaultSeason } from '../lib/seasons';

vi.mock('../hooks/useDashboardData', () => ({
  useDashboardData: vi.fn(),
}));

vi.mock('../hooks/useStatsMode', () => ({
  useStatsMode: () => ({
    statsMode: 'real',
    setStatsMode: vi.fn(),
  }),
}));

vi.mock('../ui/LazyCharts', () => ({
  DeferredPlayerBarChart: () => <div>Player Chart</div>,
  DeferredTeamTrendChart: () => <div>Trend Chart</div>,
}));

const { useDashboardData } = await import('../hooks/useDashboardData');

const baseData: DashboardData = {
  season: defaultSeason,
  games: [
    {
      id: 'g1',
      seasonId: defaultSeason.id,
      date: '2026-06-30',
      opponent: '#5-Make a Swish Foundation',
      status: 'scheduled',
      gameType: 'regular',
    },
  ],
  players: [
    { id: 'p1', name: 'Kyle' },
  ],
  playerGameStats: [],
  leagueGames: [],
  currentRatingsByTeam: {},
  ratingTimeline: [],
  futureGameProjections: [
    {
      gameId: 'g1',
      date: '2026-06-30',
      opponent: '#5-Make a Swish Foundation',
      teamElo: 1215,
      opponentElo: 1190,
      winProbability: 0.536,
      projectedSpread: -1,
    },
  ],
  futureLeagueGameProjections: [],
};

describe('DashboardPage projections', () => {
  it('renders projections when future games exist', () => {
    vi.mocked(useDashboardData).mockReturnValue({
      data: baseData,
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Projections')).toBeInTheDocument();
    expect(screen.getByText('53.6%')).toBeInTheDocument();
    expect(screen.getByText('Spread: Ballers United -1.0')).toBeInTheDocument();
  });

  it('hides projections when no future games are available', () => {
    vi.mocked(useDashboardData).mockReturnValue({
      data: {
        ...baseData,
        futureGameProjections: [],
      },
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(screen.queryByText('Projections')).not.toBeInTheDocument();
  });
});
