/**
 * Writes `dist/sitemap.xml` after the client build.
 *
 * Generated rather than committed: the catalogue changes whenever a piece is
 * added or archived, so a checked-in sitemap is wrong the moment it is written,
 * and a wrong sitemap is worse than none — it feeds a crawler URLs that 404 and
 * withholds the ones that exist.
 *
 * It writes into `dist/`, not `public/`, for the same reason: `public/` is
 * copied into the build verbatim and would put a generated file under version
 * control beside the hand-written `robots.txt`.
 *
 * Only indexable URLs go in. A sitemap is a positive claim that a URL is worth
 * indexing, so listing anything the page itself marks `noindex` — the basket,
 * checkout, the account area — is a contradiction a search console reports back
 * as an error.
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, '../dist/sitemap.xml');

const SITE_URL = (process.env.VITE_SITE_URL || 'https://furniworld.netlify.app').replace(/\/$/, '');
const API = (process.env.VITE_API_URL || 'https://furniworld-api.onrender.com/api/v1').replace(/\/$/, '');

const STATIC_PATHS = ['/', '/shop', '/about', '/services', '/contact'];
const CATEGORIES = ['living-room', 'dining-room', 'bedroom', 'office'];

// XML has five characters that cannot appear literally in text. Product names
// here contain `&` and `"` regularly, and one unescaped instance makes the
// document unparseable — which a search engine reports by silently ignoring it.
const xml = (s) =>
  String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));

const url = (loc, lastmod) =>
  `  <url>\n    <loc>${xml(SITE_URL + loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''}\n  </url>`;

const main = async () => {
  const entries = [
    ...STATIC_PATHS.map((p) => url(p)),
    ...CATEGORIES.map((c) => url(`/shop/${c}`)),
  ];

  let count = 0;
  try {
    // limit=200 comfortably covers a 50-piece catalogue in one request rather
    // than paging against a service that may cold-start for each round trip.
    const res = await fetch(`${API}/products?limit=200`, {
      signal: AbortSignal.timeout(90_000),
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const { products = [] } = await res.json();
    products.forEach((p) => entries.push(url(`/product/${p.slug}`, p.updatedAt)));
    count = products.length;
  } catch (err) {
    // A sitemap of the static and category pages still has value; failing the
    // whole deploy because the API was asleep does not.
    console.warn(`sitemap: could not list products (${err.message}) — writing without them`);
  }

  writeFileSync(
    OUT,
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`,
  );
  console.log(
    `sitemap: ${entries.length} URLs (${STATIC_PATHS.length} static, ${CATEGORIES.length} categories, ${count} products)`,
  );
};

main().catch((err) => {
  console.error(`sitemap: ${err.message}`);
  process.exit(1);
});
