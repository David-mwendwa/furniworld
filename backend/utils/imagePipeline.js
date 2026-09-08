import sharp from 'sharp';
import { statSync, unlinkSync, renameSync, utimesSync } from 'node:fs';
import { join, dirname, extname, basename } from 'node:path';

/**
 * The one description of what a product photograph should look like on disk.
 *
 * Two callers need it and they must not drift: `scripts/optimize-images.mjs`,
 * which rebuilt the seeded catalogue, and `middleware/normalizeUploads.js`,
 * which runs on every admin upload. Without the second, the first is a one-off
 * cleanup that the next upload starts undoing — the catalogue came in at
 * 6000x4000 and nothing stopped a replacement photograph arriving the same way.
 */

/*
 * The widths the layout asks for, and nothing else.
 *
 * 400 is the grid card on a phone; 800 covers that card on a 2x display and
 * the product page's main image on a laptop; 1600 is that image at 2x. There
 * is deliberately no larger tier — nothing renders an image bigger than this,
 * and adding one would put the largest file back in the srcset for a browser
 * to pick on a wide screen.
 *
 * Kept in step with `WIDTHS` in the frontend's `lib/images.js`, which builds
 * the srcset from these names. A tier here with no counterpart there is dead
 * weight; one there with no file here is a 404 inside a srcset, which a
 * browser answers by rendering no image at all.
 */
export const WIDTHS = [400, 800, 1600];

/* Quality 78 rather than the default 80: on these photographs the difference
 * is invisible at every rendered size and worth ~12% of the bytes. */
const WEBP = { quality: 78, effort: 5 };

/* The `src` fallback. 1200px is the largest the product page ever draws it at. */
const FALLBACK = { width: 1200, quality: 80 };

export const isRaster = (file) => /\.(jpe?g|png|webp|avif)$/i.test(file);

/* Encode to whatever the extension promises, so the bytes behind a filename
 * always match it. A `.png` stays a PNG — it may carry transparency, and
 * re-encoding it as JPEG would flatten that onto black. */
const encodeFallback = (ext, pipeline) => {
  if (ext === '.png') return pipeline.png({ quality: FALLBACK.quality, compressionLevel: 9 });
  if (ext === '.webp') return pipeline.webp(WEBP);
  if (ext === '.avif') return pipeline.avif({ quality: FALLBACK.quality });
  return pipeline.jpeg({ quality: FALLBACK.quality, mozjpeg: true });
};

/**
 * Resize an image in place and write its WebP derivatives beside it.
 *
 * The original filename must be preserved exactly, extension included. Five of
 * the seeded products store a `.jpeg` path, so normalising to `.jpg` costs a
 * tenth of the catalogue its photographs while every other one keeps working —
 * partial failure that reads as a flaky server rather than a rename.
 *
 * @param {string} file absolute path to the image
 * @returns {Promise<{width:number,height:number,before:number,after:number}>}
 */
export const processImage = async (file) => {
  const before = statSync(file).size;
  const dir = dirname(file);
  const ext = extname(file).toLowerCase();
  const stem = basename(file, extname(file));

  const meta = await sharp(file).metadata();
  let after = 0;

  for (const width of WIDTHS) {
    const out = join(dir, `${stem}-${width}.webp`);
    await sharp(file)
      // `withoutEnlargement` so a source narrower than the tier stays at its
      // own width rather than being upscaled into a bigger, blurrier file.
      .resize({ width, withoutEnlargement: true })
      .webp(WEBP)
      .toFile(out);
    after += statSync(out).size;
  }

  /*
   * Written to a temp file and swapped in, not encoded over itself: sharp
   * cannot read and write the same path in one pipeline — it would truncate
   * the file it is still reading — and the two-step means an interrupted run
   * leaves the original intact rather than a half-written image the shop
   * would then serve.
   */
  const tmp = join(dir, `.${stem}.tmp${ext}`);
  const sourceMtime = statSync(file).mtime;
  await encodeFallback(ext, sharp(file).resize({ width: FALLBACK.width, withoutEnlargement: true }))
    .toFile(tmp);
  const fallbackBytes = statSync(tmp).size;
  unlinkSync(file);
  renameSync(tmp, file);

  /*
   * Keep the source's original timestamp on the file that replaces it.
   *
   * Callers decide whether an image needs processing by asking whether its
   * derivatives are newer than it. Since this function rewrites the source in
   * place, a fresh mtime makes every image look modified on every subsequent
   * run — each one re-encoding the already-encoded fallback, losing quality to
   * JPEG again and growing the total rather than shrinking it. Restoring the
   * timestamp keeps that comparison meaningful, and still detects a genuinely
   * replaced photograph, whose mtime will be new.
   */
  utimesSync(file, sourceMtime, sourceMtime);

  return { width: meta.width, height: meta.height, before, after: after + fallbackBytes };
};
