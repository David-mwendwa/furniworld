import { processImage } from '../utils/imagePipeline.js';

/**
 * Resizes whatever an admin just uploaded, before the controller records it.
 *
 * multer writes the file to disk exactly as it arrived. The source catalogue
 * shows what that costs when nothing intervenes: 6000x4000 photographs at
 * ~940KB each, rendered into a 400px card. `scripts/optimize-images.mjs`
 * rebuilds the catalogue; this is what keeps an upload from undoing it.
 *
 * Runs after `upload.array` and before the controller, so `req.files` still
 * describes the same paths — the files behind them are simply smaller, and
 * each has gained the WebP derivatives `lib/images.js` builds its srcset from.
 *
 * A failure here does not fail the upload. The unprocessed original is a
 * heavy but working image, and refusing the whole request would lose the
 * admin's work over an optimisation; the size shows up in the build's image
 * budget instead.
 */
const normalizeUploads = async (req, res, next) => {
  const files = req.files ?? (req.file ? [req.file] : []);
  if (!files.length) return next();

  await Promise.all(
    files.map(async (file) => {
      try {
        await processImage(file.path);
      } catch (err) {
        console.warn(`normalizeUploads: could not process ${file.filename} — ${err.message}`);
      }
    })
  );

  next();
};

export default normalizeUploads;
