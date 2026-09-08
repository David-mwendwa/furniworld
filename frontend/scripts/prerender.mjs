/**
 * Renders the public routes to real HTML after `vite build`.
 *
 * The app is still a single-page app and still hydrates; this only changes
 * where the first paint's bytes come from. An empty `<div id="root">` caused
 * two different problems with one cause: nothing appeared until the bundle had
 * been downloaded, parsed and executed, and anything that does not run
 * JavaScript — most crawlers, every social preview unfurler — saw a shop with
 * no furniture, no headings, and one title shared by every URL on the site.
 *
 * Both are fixed by shipping the markup. The home page and the listings in
 * particular render with real products, because their opening state comes from
 * the build-time snapshot rather than a fetch (see `build-snapshot.mjs`).
 *
 * Three things make it work, each easy to undo by accident:
 *
 *   - `MemoryRouter`, not `StaticRouter`. The `react-router-dom/server` entry
 *     pulls its own copy of react-router, so the context it provides is not the
 *     one the app's `useLocation` reads, and every route renders as `/`.
 *   - `renderToPipeableStream` with `onAllReady`, not `renderToString`. Every
 *     route but Home is `React.lazy`; `renderToString` does not await suspended
 *     boundaries and would emit the fallback for all of them.
 *   - Storage must not be read during render. The session is restored in a
 *     layout effect precisely so the server's output and the browser's first
 *     render agree — see `AuthProvider`.
 *
 * Netlify serves a real file in preference to the SPA `/*` rewrite (which has
 * no `force`), so these win and the rewrite stays as the fallback.
 *
 * Runs under vite-node, not node — it imports JSX.
 */
import { createElement } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Writable } from 'node:stream';

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, '../dist');

const { default: App } = await import(new URL('../src/App.jsx', import.meta.url).href);
const { default: AppProviders } = await import(new URL('../src/AppProviders.jsx', import.meta.url).href);
const seo = await import(new URL('../src/lib/seo.js', import.meta.url).href);

/*
 * Public pages only. Checkout, the account area and the admin tree sit behind
 * guards that render a spinner until the session is verified, so prerendering
 * them would write that spinner to disk and gain nothing over the SPA fallback
 * that already serves them.
 *
 * `/cart` is included despite being `noindex`: shoppers open it constantly, its
 * shell is identical for everyone, and its contents come from their own browser
 * a moment later.
 */
const ROUTES = [
  '/',
  '/shop',
  ...seo.CATEGORY_PATHS,
  '/about',
  '/services',
  '/contact',
  '/cart',
];

/*
 * `/login` and `/register` are deliberately absent.
 *
 * Both sit behind `GuestRoute`, which renders a spinner until the session has
 * been checked — and during a prerender that check never resolves, so the file
 * on disk would contain a spinner where the form should be. That is strictly
 * worse than the neutral shell: same bytes, but a visible loading state baked
 * into the HTML. They fall through to `app.html` and set their own head tags
 * on mount, which is all they needed from this.
 */

const NOT_FOUND = { route: '/this-path-does-not-exist', file: '404.html' };

/*
 * The shell, with its authored comments stripped. Vite ships index.html's
 * comments to the browser verbatim, where view-source exposes every note about
 * fonts, preconnects and managed meta tags — reasoning that belongs in the repo.
 *
 * Only the template is stripped, never the rendered body: React writes its own
 * `<!--$-->` Suspense markers into the HTML and removing those breaks hydration.
 */
const template = readFileSync(resolve(dist, 'index.html'), 'utf8').replace(/<!--[\s\S]*?-->/g, '');

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/*
 * The head tags for a route, marked `data-seo`.
 *
 * The attribute is load-bearing: `useSeo` clears every `[data-seo]` node before
 * writing its own, so without it a hydrated page carries two descriptions and
 * two canonicals — the prerender's and the component's — which is exactly the
 * ambiguity a canonical exists to settle.
 */
const headFor = (path) => {
  const meta = seo.metaForPath(path);
  const title = seo.formatTitle(meta.title);
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta data-seo name="description" content="${escapeHtml(meta.description)}">`,
    `<meta data-seo name="robots" content="${meta.noindex ? 'noindex, nofollow' : 'index, follow'}">`,
    `<meta data-seo property="og:title" content="${escapeHtml(title)}">`,
    `<meta data-seo property="og:description" content="${escapeHtml(meta.description)}">`,
    `<meta data-seo property="og:type" content="website">`,
    `<meta data-seo property="og:site_name" content="${escapeHtml(seo.SITE_NAME)}">`,
    `<meta data-seo property="og:image" content="${seo.OG_IMAGE}">`,
    `<meta data-seo name="twitter:card" content="summary_large_image">`,
    `<meta data-seo name="twitter:title" content="${escapeHtml(title)}">`,
    `<meta data-seo name="twitter:description" content="${escapeHtml(meta.description)}">`,
    `<meta data-seo name="twitter:image" content="${seo.OG_IMAGE}">`,
  ];

  if (meta.canonical) {
    tags.push(`<meta data-seo property="og:url" content="${meta.canonical}">`);
    tags.push(`<link data-seo rel="canonical" href="${meta.canonical}">`);
  }

  // Site-level graphs belong on the home page alone — repeating them would have
  // every listing re-declaring the business that owns it.
  if (path === '/') {
    tags.push(
      `<script data-seo type="application/ld+json">${JSON.stringify([seo.organizationJsonLd(), seo.websiteJsonLd()])}</script>`,
    );
  }

  return tags.join('\n    ');
};

const render = (route) =>
  new Promise((resolvePromise, reject) => {
    let html = '';
    const sink = new Writable({
      write(chunk, _enc, cb) {
        html += chunk;
        cb();
      },
    });
    sink.on('finish', () => resolvePromise(html));

    const { pipe, abort } = renderToPipeableStream(
      createElement(
        MemoryRouter,
        { initialEntries: [route] },
        createElement(AppProviders, null, createElement(App)),
      ),
      {
        onAllReady() {
          pipe(sink);
        },
        onError(err) {
          abort();
          reject(err);
        },
      },
    );

    // A route that never settles must fail the build rather than hang it.
    setTimeout(() => {
      abort();
      reject(new Error(`timed out rendering ${route}`));
    }, 20_000).unref?.();
  });

const write = async (route, file) => {
  const body = await render(route);
  const out = template
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta\s+data-seo[\s\S]*?>/g, '')
    .replace('</head>', `  ${headFor(route)}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);

  const target = resolve(dist, file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, out);
  return { file, bytes: Buffer.byteLength(out) };
};

/*
 * The neutral shell for the SPA fallback.
 *
 * `dist/index.html` is the *home page* once this has run, so pointing the
 * fallback at it would serve the home page's markup and its canonical for every
 * product URL — telling a crawler those 50 pages are duplicates of the home
 * page — and hand `hydrateRoot` a tree for the wrong route. This carries the
 * shop's default meta, an empty root, and deliberately no canonical and no
 * JSON-LD: it stands in for many URLs and can make a claim about none of them.
 */
writeFileSync(
  resolve(dist, 'app.html'),
  template
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta\s+data-seo[\s\S]*?>/g, '')
    .replace('</head>', `  ${headFor('/')}\n  </head>`)
    .replace(/<link data-seo rel="canonical"[\s\S]*?>/g, '')
    .replace(/<meta data-seo property="og:url"[\s\S]*?>/g, '')
    .replace(/<script data-seo type="application\/ld\+json">[\s\S]*?<\/script>/g, ''),
);
console.log('prerender: app.html (SPA fallback shell)');

const results = [];
for (const route of ROUTES) {
  const file = route === '/' ? 'index.html' : `${route.replace(/^\//, '')}/index.html`;
  results.push(await write(route, file));
}
results.push(await write(NOT_FOUND.route, NOT_FOUND.file));

results.forEach((r) => console.log(`prerender: ${r.file.padEnd(30)} ${(r.bytes / 1024).toFixed(1)}KB`));
