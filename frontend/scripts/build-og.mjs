import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Rasterises scripts/og-card.svg into public/og.jpg — the 1200x630 image every
 * unfurler renders when a Furniworld link is shared.
 *
 * JPEG, not PNG. The card is large flat and gradient fills, which is close to
 * PNG's worst case and JPEG's best, and this file is fetched by every service
 * that renders a shared link.
 *
 * The step that matters is the font inlining. A rasteriser cannot fetch a
 * webfont — true of a *linked* font, false of an embedded one: QuickLook
 * renders through WebKit, which honours an @font-face whose src is a base64
 * woff2 in the document itself. So the faces are read off disk and injected
 * here, and the card is set in the same Cormorant Garamond and Jost as the shop
 * rather than in whatever the rasteriser would fall back to.
 *
 * They are injected rather than pasted into the SVG because the base64 runs to
 * ~86KB, which would bury the artwork anyone editing this needs to read. The
 * SVG keeps a single empty style element as the seam.
 *
 * The weight ranges mirror public/fonts/fonts.css, whose subset is latin-only.
 * The card's copy is plain ASCII, so the range covers it — but a glyph outside
 * the subset falls back silently, so look at the JPEG after changing the copy.
 *
 * Kept as a manual `npm run og` rather than a build step: it shells out to
 * qlmanage and sips, which are macOS-only, and the deploy builds on Netlify's
 * Linux images. The output is committed for that reason.
 */

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const FACES = [
  { family: 'Cormorant Garamond', file: 'CormorantGaramond.woff2', weight: '500 700' },
  { family: 'Jost', file: 'Jost.woff2', weight: '300 600' },
];

const fontCss = FACES.map(({ family, file, weight }) => {
  const data = readFileSync(join(root, 'public/fonts', file)).toString('base64');
  return `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};src:url(data:font/woff2;base64,${data}) format('woff2');}`;
}).join('\n');

const SEAM = '<style id="fonts" />';
const svgPath = join(root, 'scripts/og-card.svg');
const svg = readFileSync(svgPath, 'utf8');
if (!svg.includes(SEAM)) {
  throw new Error(`og-card.svg is missing its font seam: ${SEAM}`);
}

const work = mkdtempSync(join(tmpdir(), 'furniworld-og-'));
const src = join(work, 'og-card.svg');
writeFileSync(src, svg.replace(SEAM, `<style>${fontCss}</style>`));

// qlmanage rasterises into a square, which is why the source is 1200x1200 with
// the card in a band; sips then crops that band back out at 1:1.
execFileSync('qlmanage', ['-t', '-s', '1200', '-o', work, src], { stdio: 'ignore' });
execFileSync(
  'sips',
  [
    '-c', '630', '1200',
    join(work, 'og-card.svg.png'),
    '-s', 'format', 'jpeg',
    '-s', 'formatOptions', '90',
    '--out', join(root, 'public/og.jpg'),
  ],
  { stdio: 'ignore' }
);

console.log('public/og.jpg regenerated');
