'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from './api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Runs an async fetcher whenever `deps` change, and exposes loading/error
 * state plus a manual `refetch`. Guards against setting state after unmount.
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList,
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetcher()
      .then((result) => {
        if (!cancelled && isMounted.current) {
          setData(result);
        }
      })
      .catch((err) => {
        if (!cancelled && isMounted.current) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Something went wrong while loading this data.',
          );
        }
      })
      .finally(() => {
        if (!cancelled && isMounted.current) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { data, loading, error, refetch };
}
