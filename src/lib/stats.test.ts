import {
  averageStatLine,
  calculatePercentage,
  getPlayerStatsForGame,
  getPlayerStatsForPlayer,
  getRecord,
  sumStatLines,
} from './stats';
import { sampleData } from './sampleData';

describe('stats helpers', () => {
  it('computes the team record from completed games only', () => {
    expect(getRecord(sampleData.games)).toEqual({ wins: 1, losses: 0 });
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
});
