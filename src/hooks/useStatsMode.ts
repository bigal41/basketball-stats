import { useState } from 'react';
import type { StatsMode } from '../lib/stats';

export const STATS_MODE_STORAGE_KEY = 'basketball-stats:stats-mode';

const parseStatsMode = (value: string | null): StatsMode => (value === 'estimated' ? 'estimated' : 'real');

export const useStatsMode = () => {
  const [statsMode, setStatsModeState] = useState<StatsMode>(() => {
    if (typeof window === 'undefined') {
      return 'real';
    }

    return parseStatsMode(window.localStorage.getItem(STATS_MODE_STORAGE_KEY));
  });

  const setStatsMode = (nextMode: StatsMode) => {
    window.localStorage.setItem(STATS_MODE_STORAGE_KEY, nextMode);
    setStatsModeState(nextMode);
  };

  return { statsMode, setStatsMode };
};
