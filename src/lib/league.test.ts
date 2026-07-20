import {
  buildLeagueStandings,
  findLeagueTeamBySlug,
  slugifyTeamName,
} from './league';
import type { LeagueGame } from '../types';

describe('league helpers', () => {
  it('creates stable slugs for team names', () => {
    expect(slugifyTeamName('Pick & Pizza Roll')).toBe('pick-and-pizza-roll');
    expect(slugifyTeamName("LaMelo's Balls")).toBe('lamelo-s-balls');
  });

  it('resolves a team from its slug', () => {
    const games: LeagueGame[] = [
      { id: 'g1', seasonId: '2026-summer', date: '2026-01-01', homeTeam: 'Pick & Pizza Roll', awayTeam: 'Ballers United', status: 'scheduled' },
    ];

    expect(findLeagueTeamBySlug(games, 'pick-and-pizza-roll')).toBe('Pick & Pizza Roll');
    expect(findLeagueTeamBySlug(games, 'missing-team')).toBeNull();
  });

  it('ignores scheduled games when building standings', () => {
    const games: LeagueGame[] = [
      { id: 'g1', seasonId: '2026-summer', date: '2026-01-01', homeTeam: 'Ballers United', awayTeam: 'Pick & Pizza Roll', status: 'completed', homeScore: 68, awayScore: 61 },
      { id: 'g2', seasonId: '2026-summer', date: '2026-01-08', homeTeam: 'Ballers United', awayTeam: 'Grape Soda', status: 'scheduled' },
    ];

    const standings = buildLeagueStandings(games);

    expect(standings).toHaveLength(2);
    expect(standings[0]).toMatchObject({ team: 'Ballers United', wins: 1, losses: 0 });
  });
});
