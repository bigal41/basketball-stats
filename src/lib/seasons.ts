import type { Season } from '../types';

export const DEFAULT_SEASON_ID = '2026-summer';

export const defaultSeason: Season = {
  id: DEFAULT_SEASON_ID,
  label: 'Summer 2026',
  year: 2026,
  kind: 'summer',
  isActive: true,
};

export const sampleSeasons: Season[] = [defaultSeason];
