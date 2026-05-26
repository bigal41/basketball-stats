import { useEffect, useState } from 'react';
import { getSeasonData } from '../lib/data';
import type { SeasonData } from '../types';

interface SeasonDataState {
  data: SeasonData | null;
  isLoading: boolean;
  error: string | null;
}

export const useSeasonData = (): SeasonDataState => {
  const [state, setState] = useState<SeasonDataState>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    void getSeasonData()
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
            error: error instanceof Error ? error.message : 'Unable to load season data.',
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
};
