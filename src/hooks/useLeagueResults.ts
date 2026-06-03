import { useEffect, useState } from 'react';
import { getLeagueResults } from '../lib/data';
import type { LeagueGameResult } from '../types';

interface LeagueResultsState {
  data: LeagueGameResult[] | null;
  isLoading: boolean;
  error: string | null;
}

export const useLeagueResults = (): LeagueResultsState => {
  const [state, setState] = useState<LeagueResultsState>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    void getLeagueResults()
      .then((data) => {
        if (isMounted) {
          setState({ data, isLoading: false, error: null });
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setState({
            data: null,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unable to load league results.',
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
};
