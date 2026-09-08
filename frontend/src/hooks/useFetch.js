import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '../api/apiClient.js';

/**
 * Runs an async request on mount and whenever `deps` change, discarding the
 * result of a call that has already been superseded.
 *
 * `initialData` is the opening frame — normally a slice of the build-time
 * snapshot (see `scripts/build-snapshot.mjs`). A caller that supplies one
 * starts with content instead of `null` and is not `loading`, so the page
 * renders real furniture on the first paint rather than skeletons while the
 * API wakes from its ~23s cold start. The request still runs and still
 * replaces it; this only changes what is on screen in the meantime.
 *
 * Note that a failed request deliberately leaves `data` alone. That was
 * already true and matters more now: with a snapshot behind it, an API that
 * cannot be reached costs the shopper nothing rather than emptying the page.
 */
export const useFetch = (
  request,
  deps = [],
  { skip = false, initialData = null } = {}
) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!skip && initialData === null);
  const [error, setError] = useState(null);
  const generation = useRef(0);
  // Consumed by the first run only — see the note in `run`.
  const seeded = useRef(initialData !== null);

  const run = useCallback(async () => {
    const current = ++generation.current;
    /*
     * The seeded first render does not get covered by its own spinner.
     *
     * Setting `loading` unconditionally would replace the snapshot's content
     * with skeletons for the length of the request — the snapshot would have
     * done its job and nobody would have seen it. Only the first run is
     * exempt: every later one is a different query whose old results are
     * genuinely wrong to keep on screen.
     */
    if (seeded.current) {
      seeded.current = false;
    } else {
      setLoading(true);
    }
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
