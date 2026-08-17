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

export const productImageAlt = (product, index = 0) =>
  product?.images?.[index]?.alt || product?.name || 'Product photograph';
