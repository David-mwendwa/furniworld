import { useEffect, useLayoutEffect } from 'react';

/**
 * `useLayoutEffect` in the browser, `useEffect` on the server.
 *
 * The signed-in user is restored from storage after mounting rather than while
 * initialising, so that the first render matches the prerendered HTML exactly.
 * That restore has to land before the browser paints, or there is a visible
 * frame where the header says "Sign in" to someone who is signed in — which is
 * what `useLayoutEffect` guarantees and `useEffect` does not.
 *
 * React warns that `useLayoutEffect` does nothing on the server, and it is
 * right: during a prerender there is no layout and no storage to read. Swapping
 * to `useEffect` there keeps the build output clean rather than teaching anyone
 * to ignore a real warning.
 */
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default useIsomorphicLayoutEffect;
