/**
 * Rebuilds the product catalogue's photographs into responsive WebP.
 *
 * Why this exists
 * ---------------
 * The seeded catalogue shipped the photographs exactly as they came off the
 * retailer's site: 64 files, 58.7MB, every one of them **6000x4000** — 24
 * megapixels, mean 940KB, largest 1.9MB. They render into a card about 400px
 * wide, so the browser was downloading roughly fifty times the pixels it could
 * possibly draw, and a shop page of twelve products pulled ~11MB before it had
 * a picture on screen. On a furniture site the photographs *are* the product,
 * so this was the single largest thing standing between a visitor and the shop
 * — larger than the whole JavaScript bundle by an order of magnitude.
 *
 * What it produces
 * ----------------
 * For each source image, three WebP derivatives at the widths the layout
 * actually asks for, plus a resized JPEG at the original filename:
 *
 *   BIDEN.jpg        ->  BIDEN-400.webp   (grid card, phone)
 *                        BIDEN-800.webp   (grid card at 2x, detail page)
 *                        BIDEN-1600.webp  (detail page at 2x, lightbox)
 *                        BIDEN.jpg        (resized in place, same name)
 *
 * The JPEG keeps its original name and path on purpose: the database stores
 * `/images/products/BIDEN.jpg` on every product document, and rewriting 50
 * documents to chase a file extension would put the catalogue one failed
 * migration away from a shop with no pictures. Instead `lib/images.js` derives
 * the WebP names from that path, and the JPEG stays as the `src` fallback —
 * resized to 1200px, because a fallback nobody can read is still a fallback
 * that has to be downloaded by anything that does.
 *
 * Idempotent: an image whose derivatives are all newer than it is skipped, so
 * re-running after adding one product costs one image, not sixty-four.
 *
 *   npm run images:optimize
 */
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, extname, basename } from 'node:path';
import { WIDTHS, isRaster, processImage } from '../utils/imagePipeline.js';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const DIR = join(here, '../public/images/products');

const isDerivative = (name) => /-\d+\.webp$/.test(name);

const derivativesFor = (file) => {
  const stem = basename(file, extname(file));
  return WIDTHS.map((w) => join(DIR, `${stem}-${w}.webp`));
};

/* Up to date when every derivative exists and none is older than the source. A
 * plain existence check would silently keep stale renditions after an image is
 * replaced, which is the failure mode where the shop shows the old sofa. */
const isFresh = (source) => {
  const src = statSync(source).mtimeMs;
  return derivativesFor(source).every(
    (d) => existsSync(d) && statSync(d).mtimeMs >= src,
  );
};

const mb = (n) => (n / 1048576).toFixed(1);
const kb = (n) => Math.round(n / 1024);

const main = async () => {
  const files = readdirSync(DIR).filter((f) => isRaster(f) && !isDerivative(f));
  if (!files.length) {
    console.log('optimize-images: no source images found');
    return;
  }

  let before = 0, after = 0, processed = 0, skipped = 0;

  for (const file of files) {
    const source = join(DIR, file);
    const sourceBytes = statSync(source).size;
    before += sourceBytes;

    if (isFresh(source)) {
      skipped++;
      after += derivativesFor(source).reduce((n, d) => n + statSync(d).size, 0) + sourceBytes;
      continue;
    }

    const { width, height, after: written } = await processImage(source);
    after += written;
    processed++;

    console.log(
      `  ${basename(file, extname(file)).padEnd(34)} ${width}x${height} ` +
        `${kb(sourceBytes)}KB -> ${kb(written)}KB total (fallback + ${WIDTHS.length} webp)`,
    );
  }

  console.log(
    `\noptimize-images: ${processed} processed, ${skipped} already current — ` +
      `${mb(before)}MB source becomes ${mb(after)}MB total (fallback + ${WIDTHS.length} webp each)`,
  );
};

main().catch((err) => {
  console.error(`optimize-images: ${err.message}`);
  process.exit(1);
});
