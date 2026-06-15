import {
  averageStatLine,
  calculatePercentage,
  formatRecord,
  getAvailablePlayersForGame,
  getCompletedRegularSeasonGames,
  getPlayerStatsForGame,
  getPlayerStatsForPlayer,
  getRecord,
  getStatCoverage,
  getStatsForMode,
  sumStatLines,
} from './stats';
import { sampleData } from './sampleData';
import type { Game, Player, PlayerGameStat } from '../types';

describe('stats helpers', () => {
  it('computes the team record from completed games only', () => {
    expect(getRecord(sampleData.games)).toEqual({ wins: 1, losses: 0 });
  });

  it('keeps preseason out of the regular-season record', () => {
    expect(getRecord(getCompletedRegularSeasonGames(sampleData.games))).toEqual({ wins: 0, losses: 0 });
    expect(formatRecord(getRecord(sampleData.games))).toBe('1-0');
  });

  it('filters stats by game id', () => {
    expect(getPlayerStatsForGame(sampleData.playerGameStats, 'f6d6f7a5-7d4d-4fd3-922f-e3f4b3c44ca3')).toHaveLength(6);
    expect(getPlayerStatsForGame(sampleData.playerGameStats, '2a4d0f37-a395-44e8-a6f3-ed5ff62f3082')).toHaveLength(0);
  });

  it('filters stats by player id', () => {
    expect(getPlayerStatsForPlayer(sampleData.playerGameStats, '9f244eee-d3aa-4f59-8456-f9e568b56c4d')).toHaveLength(1);
  });

  it('handles zero-attempt percentages safely', () => {
    expect(calculatePercentage(0, 0)).toBe(0);
  });

  it('aggregates totals and averages', () => {
    const totals = sumStatLines(sampleData.playerGameStats);
    const averages = averageStatLine(sampleData.playerGameStats);

    expect(totals.pts).toBe(76);
    expect(totals.reb).toBe(47);
    expect(averages.pts).toBeCloseTo(12.666, 2);
  });

  it('reports stat coverage across completed games', () => {
    const games: Game[] = [
      { id: 'g1', date: '2026-01-01', opponent: 'One', status: 'completed' },
      { id: 'g2', date: '2026-01-08', opponent: 'Two', status: 'completed' },
      { id: 'g3', date: '2026-01-15', opponent: 'Three', status: 'scheduled' },
    ];
    const stats: PlayerGameStat[] = [
      { id: 's1', playerId: 'p1', gameId: 'g1', pts: 10, reb: 1, ast: 1, fgm: 4, fga: 8, tpm: 1, tpa: 3, stl: 1, blk: 0 },
    ];

    expect(getStatCoverage(games, stats)).toEqual({
      completedGames: 2,
      statBackedGames: 1,
      missingStatGames: 1,
    });
  });

  it('estimates missing game stats by player share and preserves team totals', () => {
    const players: Player[] = [
      { id: 'p1', name: 'Alex' },
      { id: 'p2', name: 'Blair' },
    ];
    const games: Game[] = [
      { id: 'g1', date: '2026-01-01', opponent: 'One', status: 'completed', teamScore: 76, oppScore: 70 },
      { id: 'g2', date: '2026-01-08', opponent: 'Two', status: 'completed', teamScore: 60, oppScore: 55 },
      { id: 'g3', date: '2026-01-15', opponent: 'Three', status: 'completed', teamScore: 70, oppScore: 65 },
    ];
    const stats: PlayerGameStat[] = [
      { id: 's1', playerId: 'p1', gameId: 'g1', pts: 34, reb: 10, ast: 4, fgm: 12, fga: 20, tpm: 3, tpa: 7, stl: 1, blk: 0 },
      { id: 's2', playerId: 'p2', gameId: 'g1', pts: 42, reb: 20, ast: 8, fgm: 15, fga: 30, tpm: 4, tpa: 9, stl: 2, blk: 1 },
      { id: 's3', playerId: 'p1', gameId: 'g2', pts: 20, reb: 8, ast: 3, fgm: 7, fga: 14, tpm: 2, tpa: 5, stl: 1, blk: 0 },
      { id: 's4', playerId: 'p2', gameId: 'g2', pts: 40, reb: 16, ast: 6, fgm: 14, fga: 28, tpm: 4, tpa: 8, stl: 1, blk: 1 },
    ];

    const estimatedStats = getStatsForMode(games, players, stats, 'estimated');
    const missingGameStats = getPlayerStatsForGame(estimatedStats, 'g3');
    const missingGameTotals = sumStatLines(missingGameStats);

    expect(missingGameStats).toHaveLength(2);
    expect(missingGameStats.every((stat) => stat.isEstimated)).toBe(true);
    expect(missingGameTotals.pts).toBe(70);
    expect(missingGameTotals.reb).toBe(27);
    expect(missingGameStats.find((stat) => stat.playerId === 'p1')?.pts).toBe(28);
  });

  it('excludes absent players from estimated stats for a game', () => {
    const players: Player[] = [
      { id: 'p1', name: 'Alex' },
      { id: 'p2', name: 'Blair' },
      { id: 'p3', name: 'Casey' },
    ];
    const games: Game[] = [
      { id: 'g1', date: '2026-01-01', opponent: 'One', status: 'completed', teamScore: 80, oppScore: 70 },
      { id: 'g2', date: '2026-01-08', opponent: 'Two', status: 'completed', teamScore: 75, oppScore: 74, absentPlayerNames: ['Casey'] },
    ];
    const stats: PlayerGameStat[] = [
      { id: 's1', playerId: 'p1', gameId: 'g1', pts: 30, reb: 8, ast: 5, fgm: 10, fga: 18, tpm: 2, tpa: 5, stl: 1, blk: 0 },
      { id: 's2', playerId: 'p2', gameId: 'g1', pts: 35, reb: 10, ast: 4, fgm: 13, fga: 20, tpm: 3, tpa: 7, stl: 1, blk: 1 },
      { id: 's3', playerId: 'p3', gameId: 'g1', pts: 15, reb: 4, ast: 2, fgm: 6, fga: 10, tpm: 1, tpa: 3, stl: 0, blk: 0 },
    ];

    const estimatedStats = getStatsForMode(games, players, stats, 'estimated');
    const missingGameStats = getPlayerStatsForGame(estimatedStats, 'g2');

    expect(getAvailablePlayersForGame(games[1], players).map((player) => player.id)).toEqual(['p1', 'p2']);
    expect(missingGameStats).toHaveLength(2);
    expect(missingGameStats.some((stat) => stat.playerId === 'p3')).toBe(false);
    expect(sumStatLines(missingGameStats).pts).toBe(75);
  });
});
