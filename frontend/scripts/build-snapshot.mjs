/**
 * Captures the storefront's above-the-fold data into `src/data/snapshot.json`.
 *
 * Why this exists
 * ---------------
 * The API runs on Render's free plan, which spins the service down after ~15
 * minutes of inactivity. Measured cold start: **22.6 seconds to first byte**.
 * The Netlify shell arrives in ~1.3s, so for the next twenty seconds a
 * first-time visitor sat looking at skeletons — the site was not slow to load,
 * it was slow to have anything in it, which reads the same from the outside.
 *
 * Nothing in the frontend can make Render boot faster. What it can do is stop
 * needing Render to have booted: the home page's four requests are made here
 * at build time and shipped inside the bundle, so the first render draws real
 * furniture from bytes already on the device. The client still calls the API
 * on mount and replaces whatever comes back — the snapshot is the opening
 * frame, not the source of truth.
 *
 * The staleness this buys is bounded and visible: `generatedAt` is written in,
 * every build refreshes it, and nothing a shopper acts on is priced from it —
 * the cart is validated and the order quoted server-side, so a stale price in
 * the snapshot cannot become a stale price on an invoice.
 *
 * Failure is not fatal. A build that cannot reach the API keeps the snapshot
 * already committed rather than overwriting it with nothing: a stale opening
 * frame is worth more than an empty one, and an API outage should not turn
 * every deploy into a blank shop.
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, '../src/data/snapshot.json');

const API = (
  process.env.VITE_API_URL || 'https://furniworld-api.onrender.com/api/v1'
).replace(/\/$/, '');

// Long enough to outlast a cold start with room to spare. This is build-time
// latency, paid once per deploy, never by a visitor.
const TIMEOUT_MS = 90_000;

const get = async (path, params = {}) => {
  const url = new URL(`${API}/${path.replace(/^\//, '')}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
};

/*
 * The exact four requests Home makes, described once.
 *
 * They were written out inline in the page and would have been written out a
 * second time here — two copies of the same parameters with nothing keeping
 * them in step. A rail whose snapshot was taken with different parameters from
 * its live fetch does not fail; it quietly swaps its contents a second after
 * the page loads, which looks like a bug in the shop.
 */
const HOME = {
  featured: ['products/featured', {}],
  facets: ['products/facets', {}],
  newest: ['products', { limit: 8, sort: 'newest' }],
  onSale: ['products', { limit: 4, onSale: 'true', sort: 'price-desc' }],
};

/* The listing page's default view — no category, page 1, `newest`. Must match
 * `useShopFilters`'s DEFAULTS and its `limit: 12`, because Shop only uses this
 * when the URL carries none of those parameters. */
const LISTING = { limit: 12, sort: 'newest' };

/* The four category listings, which are prerendered and are what a search
 * result for "dining sets kenya" should land on. Same parameters as LISTING so
 * a category page seeds exactly what its unfiltered first page will fetch. */
const CATEGORIES = ['living-room', 'dining-room', 'bedroom', 'office'];

const main = async () => {
  const snapshot = { generatedAt: new Date().toISOString() };

  const entries = await Promise.all(
    Object.entries(HOME).map(async ([key, [path, params]]) => [key, await get(path, params)]),
  );
  snapshot.home = Object.fromEntries(entries);
  snapshot.listing = { params: LISTING, ...(await get('products', LISTING)) };

  const byCategory = await Promise.all(
    CATEGORIES.map(async (category) => [
      category,
      await get('products', { ...LISTING, category }),
    ]),
  );
  snapshot.categories = Object.fromEntries(byCategory);

  const counted =
    (snapshot.home.featured?.products?.length ?? 0) +
    (snapshot.home.newest?.products?.length ?? 0) +
    (snapshot.listing.products?.length ?? 0);

  // A run that reaches the API but comes back with nothing is a failed run
  // wearing a success's clothes — refuse it rather than commit an empty shop.
  if (!counted) throw new Error('API returned no products; refusing to write an empty snapshot');

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(
    `snapshot: ${snapshot.home.featured?.products?.length ?? 0} featured, ` +
      `${snapshot.home.newest?.products?.length ?? 0} newest, ` +
      `${snapshot.listing.products?.length ?? 0} on the shop page, ` +
      `${Object.entries(snapshot.categories).map(([c, r]) => `${c}:${r.products?.length ?? 0}`).join(' ')} — ` +
      `${(readFileSync(OUT).length / 1024).toFixed(1)}KB`,
  );
};

main().catch((err) => {
  if (existsSync(OUT)) {
    const { generatedAt } = JSON.parse(readFileSync(OUT, 'utf8'));
    console.warn(
      `snapshot: refresh failed (${err.message}) — keeping the committed one from ${generatedAt}`,
    );
    process.exit(0);
  }
  console.error(`snapshot: refresh failed and there is nothing to fall back to — ${err.message}`);
  process.exit(1);
});
