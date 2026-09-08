// Product images are served by the API, not bundled with the frontend, so a
// relative path from the database needs the API origin prefixed. Moving to a CDN
// later is a change to this one function.
const ASSET_ORIGIN = (
  import.meta.env.VITE_ASSET_URL || 'http://localhost:5005'
).replace(/\/$/, '');

export const assetUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return `${ASSET_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
};

export const productImage = (product, index = 0) =>
  assetUrl(product?.images?.[index]?.url);

/*
 * The responsive WebP set for a product photograph.
 *
 * `scripts/optimize-images.mjs` writes three derivatives beside every source —
 * `BIDEN.jpg` gets `BIDEN-400.webp`, `BIDEN-800.webp`, `BIDEN-1600.webp` — so
 * the names are derivable from the stored path and nothing had to change in
 * the database. The stored `.jpg` stays the `src`, which is what a browser
 * without WebP falls back to and what an `<img>` uses if this returns nothing.
 *
 * This matters more here than on most shops. The catalogue's photographs came
 * off the source site at 6000x4000 — 24 megapixels, ~940KB each — and render
 * into a card about 400px wide, so a shop page was pulling roughly 11MB to
 * draw twelve thumbnails. The derivatives put that at about 25KB apiece.
 *
 * Returns '' for anything that is not one of our own optimised files (an
 * absolute URL from elsewhere, an admin upload that predates the pipeline, an
 * SVG), so callers can pass it straight to `srcSet` and get the plain `src`
 * behaviour when there is no set to offer.
 */
export const WIDTHS = [400, 800, 1600];

/** The set for a stored image path. `productSrcSet` is this, reached via a product. */
export const imageSrcSet = (url) => {
  // Only paths we generated derivatives for. An off-site URL has no siblings
  // to point at, and claiming otherwise would produce a srcset of 404s — which
  // a browser resolves by showing no image at all, not by falling back to src.
  if (!url || /^https?:\/\//.test(url) || !/\.(jpe?g|png)$/i.test(url)) return '';

  const stem = url.replace(/\.[^.]+$/, '');
  return WIDTHS.map((w) => `${assetUrl(`${stem}-${w}.webp`)} ${w}w`).join(', ');
};

export const productSrcSet = (product, index = 0) =>
  imageSrcSet(product?.images?.[index]?.url);

export const productImageAlt = (product, index = 0) =>
  product?.images?.[index]?.alt || product?.name || 'Product photograph';
