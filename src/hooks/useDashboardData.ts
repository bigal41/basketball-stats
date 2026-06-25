import { useEffect, useState } from 'react';
import { getDashboardData } from '../lib/data';
import type { DashboardData } from '../types';

interface DashboardDataState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
}

export const useDashboardData = (): DashboardDataState => {
  const [state, setState] = useState<DashboardDataState>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    void getDashboardData()
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
            error: error instanceof Error ? error.message : 'Unable to load dashboard data.',
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
};
