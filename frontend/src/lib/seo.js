import { CATEGORIES, CATEGORY_LABELS } from '../constants/catalog.js';

/**
 * Every page's title, description, canonical and structured data.
 *
 * A single-page app serves one HTML file for every URL, so without this the
 * whole shop — the home page, four category listings, fifty products — is one
 * page called "Furniworld — Furniture for Kenyan homes" with an empty body, as
 * far as anything that reads HTML is concerned.
 *
 * Two consumers read this and they must agree: `hooks/useSeo.js` applies it to
 * `document.head` at runtime, and `scripts/prerender.mjs` writes the same tags
 * into the static HTML at build time. A prerendered `<title>` that disagrees
 * with the one React sets on hydration is the kind of thing nothing reports
 * and every audit flags.
 */

export const SITE_URL = (
  import.meta.env?.VITE_SITE_URL || 'https://furniworld.netlify.app'
).replace(/\/$/, '');

export const SITE_NAME = 'Furniworld';

export const DEFAULT_DESCRIPTION =
  'Furniworld — sofas, dining sets, coffee tables and office furniture, delivered across Kenya.';

export const OG_IMAGE = `${SITE_URL}/og.jpg`;

export const absoluteUrl = (path = '/') =>
  `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

/*
 * Titles are `<page> · Furniworld`, except the home page, where repeating the
 * brand would read as a bug. Google truncates around 60 characters, so the
 * distinguishing half goes first.
 */
export const formatTitle = (title) =>
  !title || title === SITE_NAME
    ? `${SITE_NAME} — Furniture for Kenyan homes`
    : `${title} · ${SITE_NAME}`;

/*
 * `noindex` is not a detail. Checkout, the order-success page, the account area
 * and the whole admin tree are private, single-use or both — a crawler
 * indexing them lists URLs that render a sign-in redirect, which is a set of
 * dead entries under the shop's own name. `/cart` is a shopper's own basket
 * and equally not somewhere anyone should arrive from a search.
 */
const STATIC = {
  '/': { title: SITE_NAME, description: DEFAULT_DESCRIPTION },
  '/shop': {
    title: 'All furniture',
    description:
      'Browse every piece Furniworld sells — living room, dining, bedroom and office furniture, priced in KES and delivered across Kenya.',
  },
  '/about': {
    title: 'About',
    description: 'Who Furniworld is, and how we choose the furniture we sell.',
  },
  '/services': {
    title: 'Services',
    description: 'Delivery, assembly and the help we offer around a Furniworld order.',
  },
  '/contact': {
    title: 'Contact',
    description: 'How to reach Furniworld about an order or a piece you are considering.',
  },
  '/login': {
    title: 'Sign in',
    description: 'Sign in to your Furniworld account to check out and track orders.',
  },
  '/register': {
    title: 'Create an account',
    description: 'Create a Furniworld account to check out and follow your orders.',
  },
  '/forgot-password': {
    title: 'Reset your password',
    description: 'Send a password reset link to your email.',
    noindex: true,
  },
  '/cart': { title: 'Your basket', description: 'The pieces in your Furniworld basket.', noindex: true },
  '/checkout': { title: 'Checkout', description: 'Complete your Furniworld order.', noindex: true },
  '/404': { title: 'Page not found', description: 'That page does not exist on Furniworld.', noindex: true },
};

/** The four category listings, built from the catalogue rather than retyped. */
export const CATEGORY_PATHS = CATEGORIES.map((c) => `/shop/${c.slug}`);

/**
 * The routes the build writes to a file of their own.
 *
 * scripts/prerender.mjs renders exactly this list, and scripts/build-sitemap.mjs
 * reads it, so the three cannot drift into disagreeing about which URLs exist.
 * Adding a path here therefore changes what is rendered, what the sitemap
 * advertises, and which canonicals gain a trailing slash — check all three.
 *
 * Public pages only. Checkout, the account area and the admin tree sit behind
 * guards that render a spinner until the session is verified, so prerendering
 * them would write that spinner to disk and gain nothing over the SPA fallback
 * that already serves them. `/login` and `/register` are absent for the same
 * reason: `GuestRoute` never resolves during a prerender, so the file would
 * hold a spinner where the form should be — strictly worse than the neutral
 * shell, since it bakes a visible loading state into the HTML.
 *
 * `/cart` is included despite being `noindex`: shoppers open it constantly, its
 * shell is identical for everyone, and its contents come from their own browser
 * a moment later.
 */
export const PRERENDERED_PATHS = [
  '/',
  '/shop',
  ...CATEGORY_PATHS,
  '/about',
  '/services',
  '/contact',
  '/cart',
];

/**
 * The path a route is actually served at, trailing slash included where one is
 * required.
 *
 * A prerendered route is a directory — `/shop` is `shop/index.html` — which
 * Netlify answers at `/shop/`, redirecting `/shop` to it. So naming the
 * un-slashed form in a canonical or a sitemap points at a 301 instead of at the
 * page. A direct hit hides this completely, because the redirect resolves
 * before anything reads the tag; only a crawler comparing the URL it asked for
 * against the one the page claims ever sees it.
 *
 * The inverse is just as wrong: nothing redirects a route served by the SPA
 * fallback, so a slash on `/product/x` names a URL that does not exist. Hence a
 * list rather than a blanket rule. A query string is preserved and never
 * considered — `/shop?page=2` is still the `/shop` file.
 */
export const canonicalPath = (path = '/') => {
  const [rawPath, query] = String(path).split('?');
  const clean = rawPath.length > 1 ? rawPath.replace(/\/$/, '') : rawPath;
  const slashed =
    clean !== '/' && PRERENDERED_PATHS.includes(clean) ? `${clean}/` : clean;
  return query ? `${slashed}?${query}` : slashed;
};

/** Absolute canonical URL for a path. The only thing that should build one. */
export const canonicalUrl = (path = '/') => absoluteUrl(canonicalPath(path));

export const metaForPath = (pathname) => {
  const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;

  // Prefix matches rather than one entry per screen: the account and admin
  // areas are a dozen routes that all want the same answer, and a table entry
  // each is a dozen chances to forget one and leak a staff page into an index.
  if (path.startsWith('/admin'))
    return { title: 'Admin', description: 'Furniworld staff area.', noindex: true, canonical: null };
  if (path.startsWith('/account'))
    return { title: 'Your account', description: 'Manage your Furniworld account.', noindex: true, canonical: null };
  if (path.startsWith('/checkout') || path.startsWith('/reset-password'))
    return { ...STATIC['/checkout'], canonical: null };

  const category = path.startsWith('/shop/') ? path.slice('/shop/'.length) : null;
  if (category && CATEGORY_LABELS[category]) {
    const { blurb } = CATEGORIES.find((c) => c.slug === category);
    return {
      title: CATEGORY_LABELS[category],
      description: `${CATEGORY_LABELS[category]} furniture from Furniworld — ${blurb.toLowerCase()} Delivered across Kenya.`,
      canonical: canonicalUrl(path),
    };
  }

  const meta = STATIC[path];
  if (!meta) return { ...STATIC['/404'], canonical: null };
  return { ...meta, canonical: meta.noindex ? null : canonicalUrl(path) };
};

/* ---------------------------------------------------------------------------
 * Structured data. JSON-LD rather than microdata: it sits in one script tag
 * instead of being threaded through the markup as attributes, so the rendered
 * DOM and the data a crawler reads cannot drift apart when a component is
 * restyled.
 * ------------------------------------------------------------------------ */

export const organizationJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'FurnitureStore',
  name: SITE_NAME,
  url: SITE_URL,
  image: OG_IMAGE,
  description: DEFAULT_DESCRIPTION,
  areaServed: { '@type': 'Country', name: 'Kenya' },
  currenciesAccepted: 'KES',
});

export const websiteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    // The shop reads `?search=`, so this is the query the storefront actually
    // honours rather than an invented one.
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/shop?search={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
});

export const breadcrumbJsonLd = (crumbs) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: canonicalUrl(c.path),
  })),
});

/**
 * A product, as a search engine reads one.
 *
 * `offers.price` is what a shopper actually pays, which is `price` —
 * `compareAtPrice` is the struck-through was-price and publishing that while
 * the page shows the lower one is the mismatch that gets rich results
 * suppressed. `aggregateRating` is omitted entirely when nothing has been
 * reviewed: an empty rating object is invalid, and a `ratingValue` of 0 claims
 * a real, terrible score rather than the absence of one.
 */
export const productJsonLd = (product, imageUrl) => {
  if (!product) return null;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    url: absoluteUrl(`/product/${product.slug}`),
    image: imageUrl ? [imageUrl] : undefined,
    description: product.shortDescription || product.description || undefined,
    sku: product.sku || undefined,
    category: CATEGORY_LABELS[product.category] || undefined,
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/product/${product.slug}`),
      priceCurrency: 'KES',
      price: String(product.price),
      availability: `https://schema.org/${product.stock > 0 ? 'InStock' : 'OutOfStock'}`,
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
  };

  if (product.ratingsCount > 0) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(product.ratingsAverage).toFixed(1),
      reviewCount: product.ratingsCount,
    };
  }

  return data;
};

export const itemListJsonLd = (products, path) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  url: canonicalUrl(path),
  numberOfItems: products.length,
  itemListElement: products.map((p, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: absoluteUrl(`/product/${p.slug}`),
    name: p.name,
  })),
});
