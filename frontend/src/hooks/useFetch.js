import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '../api/apiClient.js';

/**
 * Runs an async request on mount and whenever `deps` change, discarding the
 * result of a call that has already been superseded.
 */
export const useFetch = (request, deps = [], { skip = false } = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);
  const generation = useRef(0);

  const run = useCallback(async () => {
    const current = ++generation.current;
    setLoading(true);
    setError(null);

    try {
      const response = await request();
      if (current === generation.current) setData(response.data);
    } catch (err) {
      if (current === generation.current) setError(errorMessage(err));
    } finally {
      if (current === generation.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (skip) {
      setLoading(false);
      return;
    }
    run();
  }, [run, skip]);

  return { data, loading, error, refetch: run, setData };
};
