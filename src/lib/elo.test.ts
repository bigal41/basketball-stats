import {
  asCompletedLeagueGameResults,
  buildFutureGameProjections,
  buildFutureLeagueGameProjections,
  buildEloRatings,
  ELO_INITIAL_RATING,
  normalizeTeamName,
} from './elo';
import { leagueResults } from './league';
import { sampleData } from './sampleData';
import type { LeagueGameResult } from '../types';

describe('elo helpers', () => {
  it('starts teams at 1200 before their first game', () => {
    const [firstResult] = asCompletedLeagueGameResults(leagueResults);
    const { ratingTimeline } = buildEloRatings([firstResult]);

    expect(ratingTimeline[0]?.homeTeamPreRating).toBe(ELO_INITIAL_RATING);
    expect(ratingTimeline[0]?.awayTeamPreRating).toBe(ELO_INITIAL_RATING);
  });

  it('gives the winner rating gain and the loser rating loss', () => {
    const [firstResult] = asCompletedLeagueGameResults(leagueResults);
    const { currentRatingsByTeam } = buildEloRatings([firstResult]);

    expect(currentRatingsByTeam[firstResult.awayTeam]?.rating).toBeGreaterThan(ELO_INITIAL_RATING);
    expect(currentRatingsByTeam[firstResult.homeTeam]?.rating).toBeLessThan(ELO_INITIAL_RATING);
  });

  it('is deterministic for identical sorted results', () => {
    const completedResults = asCompletedLeagueGameResults(leagueResults);
    const shuffledResults: LeagueGameResult[] = [
      completedResults[4],
      completedResults[0],
      completedResults[3],
      completedResults[1],
      completedResults[2],
    ];

    const firstRun = buildEloRatings(shuffledResults);
    const secondRun = buildEloRatings([...shuffledResults].reverse());

    expect(firstRun.currentRatingsByTeam).toEqual(secondRun.currentRatingsByTeam);
    expect(firstRun.ratingTimeline).toEqual(secondRun.ratingTimeline);
  });

  it('normalizes ranked opponent labels for matching', () => {
    expect(normalizeTeamName('#1-Amish Ballers')).toBe('Amish Ballers');
  });

  it('falls back to 1200 for an unmatched future opponent', () => {
    const { currentRatingsByTeam } = buildEloRatings(asCompletedLeagueGameResults(leagueResults));
    const projections = buildFutureGameProjections(
      [
        {
          id: 'g1',
          seasonId: '2026-summer',
          date: '2026-07-30',
          opponent: '#9-New Team',
          status: 'scheduled',
          gameType: 'regular',
        },
      ],
      currentRatingsByTeam,
      { asOfDate: '2026-06-25' },
    );

    expect(projections[0]?.opponentElo).toBe(ELO_INITIAL_RATING);
  });

  it('projects only future non-completed games for Ballers United', () => {
    const { currentRatingsByTeam } = buildEloRatings(asCompletedLeagueGameResults(leagueResults));
    const projections = buildFutureGameProjections(sampleData.games, currentRatingsByTeam, {
      asOfDate: '2026-06-25',
    });

    expect(projections.map((projection) => projection.gameId)).toEqual([
      'b81822a4-ec98-4bb7-b602-baf33d1dbeb1',
      '6b43f6fa-b965-471b-9851-f50a6af80399',
      'c73e6289-a8e7-48f9-b1d4-ae6a45464e6e',
      '8de92ca8-b53d-4b20-ad3f-2c13c7be8669',
      '086ca590-ecbe-4d8b-b1c8-d85616f640d2',
    ]);
  });

  it('creates win probability and spread for each projected game', () => {
    const { currentRatingsByTeam } = buildEloRatings(asCompletedLeagueGameResults(leagueResults));
    const projections = buildFutureGameProjections(sampleData.games, currentRatingsByTeam, {
      asOfDate: '2026-06-25',
    });

    expect(projections.every((projection) => projection.winProbability > 0 && projection.winProbability < 1)).toBe(true);
    expect(projections.every((projection) => Number.isFinite(projection.projectedSpread))).toBe(true);
  });

  it('changes projected ratings when new league results are added', () => {
    const completedResults = asCompletedLeagueGameResults(leagueResults);
    const baseRatings = buildEloRatings(completedResults.slice(0, -1)).currentRatingsByTeam;
    const updatedRatings = buildEloRatings(completedResults).currentRatingsByTeam;

    expect(updatedRatings['Ballers United']?.rating).not.toBe(baseRatings['Ballers United']?.rating);
    expect(updatedRatings['Make a Swish Foundation']?.rating).not.toBe(baseRatings['Make a Swish Foundation']?.rating);
  });

  it('creates win probabilities for future league games', () => {
    const { currentRatingsByTeam } = buildEloRatings(asCompletedLeagueGameResults(leagueResults));
    const projections = buildFutureLeagueGameProjections(leagueResults, currentRatingsByTeam, {
      asOfDate: '2026-07-01',
    });

    expect(projections.length).toBeGreaterThan(0);
    expect(projections.every((projection) => projection.homeWinProbability > 0 && projection.homeWinProbability < 1)).toBe(true);
    expect(projections.every((projection) => projection.awayWinProbability > 0 && projection.awayWinProbability < 1)).toBe(true);
  });
});
