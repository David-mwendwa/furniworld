/**
 * Fails the build when something that was fixed has quietly come back.
 *
 * Everything checked here is a regression this project has had or is one
 * careless commit away from having, and none of it announces itself: the
 * bundle grows, a 6000x4000 photograph lands back in the catalogue, the
 * fallback shell starts carrying the home page's canonical. The site still
 * deploys and still works, which is why it needs a gate rather than a habit.
 *
 * Run as the last step of `npm run build`.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { resolve, dirname, join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const failures = [];
const notes = [];
const fail = (msg) => failures.push(msg);

const read = (f) => readFileSync(join(dist, f), 'utf8');
const has = (f) => existsSync(join(dist, f));

/*
 * The routes the prerender is expected to have written. Listed here rather than
 * imported from prerender.mjs: a check that reads its expectations from the
 * thing it is checking cannot catch that thing dropping a route.
 */
const PRERENDERED = [
  'index.html',
  'shop/index.html',
  'shop/living-room/index.html',
  'shop/dining-room/index.html',
  'shop/bedroom/index.html',
  'shop/office/index.html',
  'about/index.html',
  'services/index.html',
  'contact/index.html',
  'cart/index.html',
  '404.html',
];

/*
 * The gzipped budget for everything the browser must fetch before it can paint
 * the home page — the entry, every `modulepreload` it names, and the CSS.
 *
 * The ceiling leaves room for ordinary change but not for the one regression
 * that matters: un-lazying the routes, which folds the checkout, its Stripe SDK
 * and all nine admin screens back into the chunk every shopper downloads and
 * costs ~30KB gzipped. Raise it only with a reason.
 */
const CRITICAL_PATH_BUDGET_KB = 128;

/*
 * The catalogue's photographs, which were the single biggest thing on this
 * site: 64 files, 58.7MB, every one 6000x4000, rendered into a 400px card.
 *
 * `npm run images:optimize` in the backend rebuilds them, and the upload path
 * normalises new ones — but a photograph committed by hand bypasses both, and
 * nothing about the page would look wrong. These are the sizes that pipeline
 * produces with headroom, so a source that skipped it fails here instead.
 */
const IMAGE_DIR = join(root, '../backend/public/images/products');
const MAX_IMAGE_KB = 300;
const MAX_IMAGE_DIR_MB = 20;

// --- The prerender ran and produced pages with content in them --------------
for (const file of PRERENDERED) {
  if (!has(file)) {
    fail(`prerender did not write ${file}`);
    continue;
  }
  const html = read(file);
  // Authored comments must not reach production. The shell's notes about fonts,
  // preconnects and managed meta tags are for the repo; view-source is not the
  // place to publish them. React's own hydration markers — <!--$-->, <!--/$-->
  // and the <!-- --> text separator — are required and are exempt.
  const authored = [...html.matchAll(/<!--([\s\S]*?)-->/g)]
    .map((m) => m[1])
    .filter((c) => !/^\/?\$|^\s*-?\s*$/.test(c));
  if (authored.length) fail(`${file}: ${authored.length} authored comment(s) reached the built HTML`);


  /*
   * Everything from the opening root div to `</body>`. Anchoring the end on
   * `</div>` does not work: React writes its own inline `<script>` after the
   * markup on routes with Suspense boundaries and not on routes without, so
   * any pattern tight enough to find the closing root div matches in one place
   * and nowhere at all in another.
   */
  const start = html.indexOf('<div id="root">');
  const rendered = start === -1 ? '' : html.slice(start + 15, html.indexOf('</body>'));
  if (rendered.trim().length < 500) {
    fail(`${file} has an empty or near-empty #root — it shipped the shell, not the page`);
  }

  const canonicals = (html.match(/rel="canonical"/g) || []).length;
  const descriptions = (html.match(/name="description"/g) || []).length;
  if (canonicals > 1) fail(`${file} has ${canonicals} canonical tags`);
  if (descriptions !== 1) fail(`${file} has ${descriptions} description tags, expected 1`);

  // Exactly one h1. Zero is a page with no stated subject, more than one is
  // ambiguity, and a refactor introduces either silently.
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) fail(`${file} has ${h1s} <h1> elements, expected exactly 1`);

  if (!/<title>[\s\S]*?\S[\s\S]*?<\/title>/.test(html)) fail(`${file} has no <title>`);

  /*
   * The canonical names the URL this very file is served at.
   *
   * Netlify serves `about/index.html` at `/about/` and redirects `/about` to
   * it, so a canonical spelled without the slash points at a 301 rather than at
   * the page — and every sitemap entry beside it points at the same redirect.
   * Nothing about the rendered page looks wrong, and a direct hit cannot show
   * it, because the redirect resolves before anything reads the tag.
   *
   * `404.html` is exempt: Netlify serves it by name, not at a route of its own.
   */
  if (file !== '404.html') {
    const served = file === 'index.html' ? '/' : `/${file.replace(/index\.html$/, '')}`;
    const href = (html.match(/rel="canonical" href="([^"]*)"/) || [])[1];
    if (href) {
      const actual = new URL(href).pathname;
      if (actual !== served) {
        fail(`${file} is served at ${served} but its canonical claims ${actual}`);
      }
    }
  }

  // Vite rewrites /src/* to hashed /assets/*. A surviving reference is a URL
  // that only resolves while the dev server is running.
  if (/["'(]\/src\//.test(html)) fail(`${file} references a dev-only /src/ path`);
}

// --- The SPA fallback shell is a SHELL --------------------------------------
if (!has('app.html')) {
  fail('app.html is missing — the SPA fallback in netlify.toml points at it');
} else {
  const shell = read('app.html');
  if (!/<div id="root"><\/div>/.test(shell))
    fail('app.html has content in #root; it must stay an empty shell (see netlify.toml)');
  if (/rel="canonical"/.test(shell))
    fail('app.html carries a canonical — it stands in for many URLs and can claim none of them');
  if (/application\/ld\+json/.test(shell))
    fail('app.html carries JSON-LD describing a page it is not');
}

// --- SEO artefacts ----------------------------------------------------------
for (const f of ['robots.txt', 'sitemap.xml', 'og.jpg', 'fonts/Jost.woff2', 'fonts/CormorantGaramond.woff2']) {
  if (!has(f)) fail(`${f} is missing from the build`);
}

if (has('sitemap.xml')) {
  const sm = read('sitemap.xml');
  const urls = (sm.match(/<loc>/g) || []).length;
  if (/&(?!amp;|lt;|gt;|apos;|quot;|#)/.test(sm)) fail('sitemap.xml contains an unescaped &');
  if (urls < 20) {
    const msg = `sitemap.xml has only ${urls} URLs — the product listing failed`;
    // Both build scripts allow 90s per request. That was "well past" a 22.6s
    // cold start when written; the same measurement was 32.8s on 2026-09-10,
    // and a deploy did fail here on 2026-09-09 — so read this as "the API did
    // not answer in 90s", which is usually unreachable but no longer certainly
    // so. The snapshot step runs first and warms the service, so a failure
    // here after a successful snapshot really is the API going away.
    // The override is an explicit decision in the deploy log; the pages are
    // unaffected either way, since the snapshot falls back to its committed copy.
    if (process.env.ALLOW_PARTIAL_SITEMAP === '1') notes.push(`${msg} (allowed by ALLOW_PARTIAL_SITEMAP)`);
    else fail(`${msg}. Set ALLOW_PARTIAL_SITEMAP=1 to deploy anyway.`);
  }
  /*
   * Every listed URL is the one Netlify actually answers, not one it redirects.
   *
   * A prerendered route is a directory and is served with a trailing slash; a
   * route that falls through to app.html is not and must not carry one. A
   * sitemap full of 301s spends the crawl budget twice over to reach the same
   * pages, and the two forms are indistinguishable by eye.
   */
  for (const loc of [...sm.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1])) {
    const path = new URL(loc.replace(/&amp;/g, '&')).pathname;
    if (path === '/') continue;
    const isDirectory = has(`${path.replace(/^\/|\/$/g, '')}/index.html`);
    if (isDirectory && !path.endsWith('/'))
      fail(`sitemap.xml lists ${path}, which redirects to ${path}/`);
    if (!isDirectory && path.endsWith('/'))
      fail(`sitemap.xml lists ${path}, but nothing is served at that URL`);
  }

  notes.push(`sitemap.xml: ${urls} URLs`);
}

if (has('robots.txt') && !read('robots.txt').includes('Sitemap:')) {
  fail('robots.txt does not point at the sitemap');
}

/*
 * A deploy build must not have fallen back to the development origins.
 *
 * `VITE_API_URL` and `VITE_ASSET_URL` are set in the Netlify UI, not in the
 * repo, and Vite inlines whatever they hold at build time. Unset, the defaults
 * in api/apiClient.js and lib/images.js are localhost — which builds, passes
 * every other check here, deploys, and produces a site that renders its whole
 * shell and then loads no products and no photographs, because the browser is
 * calling a machine that is not there.
 *
 * Only enforced where the answer is knowable: NETLIFY is set in their build
 * image, and a local build with no env file is ordinary and must stay quiet.
 */
{
  const bundles = readdirSync(join(dist, 'assets')).filter((f) => f.endsWith('.js'));
  const offenders = bundles.filter((f) =>
    // The port is what distinguishes the app's own dev origin from the bare
    // `http://localhost` that react-router and axios each carry as an internal
    // fallback for URL parsing. Matching without it fails every correct deploy.
    /https?:\/\/(localhost|127\.0\.0\.1):\d+/.test(readFileSync(join(dist, 'assets', f), 'utf8')),
  );
  if (offenders.length) {
    const msg = `${offenders.length} bundle(s) name a localhost origin — VITE_API_URL and VITE_ASSET_URL were not set for this build`;
    if (process.env.NETLIFY) fail(msg);
    else notes.push(`${msg} (local build, not enforced)`);
  }
}

// --- Critical path ----------------------------------------------------------
const shellHtml = has('index.html') ? read('index.html') : '';
const assets = [...shellHtml.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]);

if (!assets.length) {
  fail('could not find any /assets/ references in index.html');
} else {
  const rows = assets.map((a) => [a, gzipSync(readFileSync(join(dist, a.slice(1)))).length]);
  const kb = rows.reduce((n, [, b]) => n + b, 0) / 1024;
  notes.push(`critical path: ${kb.toFixed(1)}KB gzipped across ${assets.length} files (budget ${CRITICAL_PATH_BUDGET_KB}KB)`);
  if (kb > CRITICAL_PATH_BUDGET_KB) {
    fail(`critical path is ${kb.toFixed(1)}KB gzipped, over the ${CRITICAL_PATH_BUDGET_KB}KB budget`);
    rows.sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(([a, b]) => fail(`    ${(b / 1024).toFixed(1)}KB  ${a}`));
  }
}

// --- Product photographs ----------------------------------------------------
if (!existsSync(IMAGE_DIR)) {
  notes.push('image budget skipped — backend/public/images/products not present');
} else {
  const files = readdirSync(IMAGE_DIR).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  let total = 0;
  const oversized = [];
  const missingDerivatives = [];

  for (const f of files) {
    const bytes = statSync(join(IMAGE_DIR, f)).size;
    total += bytes;
    if (bytes / 1024 > MAX_IMAGE_KB) oversized.push(`${f} ${Math.round(bytes / 1024)}KB`);
    // Every raster source needs its WebP set, or `imageSrcSet` points at 404s —
    // which a browser answers by rendering no image at all, not by falling back.
    if (!/-\d+\.webp$/.test(f) && /\.(jpe?g|png)$/i.test(f)) {
      const stem = basename(f, extname(f));
      for (const w of [400, 800, 1600]) {
        if (!existsSync(join(IMAGE_DIR, `${stem}-${w}.webp`))) missingDerivatives.push(`${stem}-${w}.webp`);
      }
    }
  }

  const mb = total / 1048576;
  notes.push(`product images: ${files.length} files, ${mb.toFixed(1)}MB (budget ${MAX_IMAGE_DIR_MB}MB)`);
  if (mb > MAX_IMAGE_DIR_MB) fail(`product images total ${mb.toFixed(1)}MB, over the ${MAX_IMAGE_DIR_MB}MB budget — run npm run images:optimize in backend/`);
  oversized.slice(0, 5).forEach((f) => fail(`image over ${MAX_IMAGE_KB}KB: ${f} — run npm run images:optimize in backend/`));
  missingDerivatives.slice(0, 5).forEach((f) => fail(`missing responsive derivative: ${f} — run npm run images:optimize in backend/`));
}

notes.forEach((n) => console.log(`verify: ${n}`));

// public/ is copied into dist untouched, so the notes in fonts.css, robots.txt
// and the logo SVGs are served to anyone who opens them — a favicon is fetched
// by every browser tab. fonts.css is also render-blocking, which puts its
// comment bytes on the critical path. dist/assets is skipped: Vite minifies
// what it emits there, and its `/*!` licence headers are meant to survive.
const checkAssetComments = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'assets') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      checkAssetComments(full);
      continue;
    }
    const marker = entry.name.endsWith('.svg')
      ? /<!--/
      : entry.name.endsWith('.css')
        ? /\/\*/
        : entry.name.endsWith('.txt')
          ? /^[ \t]*#/m
          : null;
    if (marker && marker.test(readFileSync(full, 'utf8'))) {
      fail(`${full.slice(full.indexOf('dist'))}: authored comments reached the build`);
    }
  }
};
checkAssetComments(dist);

if (failures.length) {
  console.error(`\nverify-build: ${failures.length} problem(s)\n`);
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log('verify: build is good');
