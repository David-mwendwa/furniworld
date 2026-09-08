import { useEffect } from 'react';

import {
  DEFAULT_DESCRIPTION,
  OG_IMAGE,
  SITE_NAME,
  formatTitle,
} from '../lib/seo.js';

/**
 * Writes a route's head tags, and takes them back down again.
 *
 * There is no head-management library here on purpose. Those exist to
 * reconcile tags contributed by many components at many depths; this app has
 * exactly one caller per page, so the machinery would only add weight to the
 * critical path of a shop whose problem was weight.
 *
 * The cleanup is the part a hand-rolled version usually forgets, and the part
 * that matters. Without it tags accumulate across client-side navigations: go
 * from a product page to the basket and the basket keeps the product's
 * canonical, its Open Graph image and its Product JSON-LD, so a crawler
 * following that navigation sees a basket claiming to be a dining set. Every
 * tag written here is marked `data-seo`, and the whole set is cleared before
 * the next route's is written — which also clears what the prerender put in
 * the static HTML, so a hydrated page carries one description, not two.
 */

const meta = (attr, key, content) => {
  if (!content) return;
  const el = document.createElement('meta');
  el.setAttribute(attr, key);
  el.setAttribute('content', content);
  el.setAttribute('data-seo', '');
  document.head.appendChild(el);
};

export const useSeo = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  image = OG_IMAGE,
  type = 'website',
  noindex = false,
  jsonLd,
} = {}) => {
  /*
   * `jsonLd` is normally an object built inline by the calling page, so it is a
   * new identity on every render. Serialising it once gives the effect a
   * dependency that compares by value — without it the head is torn down and
   * rebuilt on every keystroke in the shop's search box.
   */
  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    document.head.querySelectorAll('[data-seo]').forEach((el) => el.remove());

    const fullTitle = formatTitle(title);
    document.title = fullTitle;

    meta('name', 'description', description);
    meta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    meta('property', 'og:title', fullTitle);
    meta('property', 'og:description', description);
    meta('property', 'og:type', type);
    meta('property', 'og:site_name', SITE_NAME);
    meta('property', 'og:image', image);
    if (canonical) meta('property', 'og:url', canonical);

    // Twitter reads og:* for most fields but needs its own card type, without
    // which a shared link renders as a bare link rather than a preview.
    meta('name', 'twitter:card', 'summary_large_image');
    meta('name', 'twitter:title', fullTitle);
    meta('name', 'twitter:description', description);
    meta('name', 'twitter:image', image);

    if (canonical) {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = canonical;
      link.setAttribute('data-seo', '');
      document.head.appendChild(link);
    }

    if (jsonLdKey) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = jsonLdKey;
      script.setAttribute('data-seo', '');
      document.head.appendChild(script);
    }

    return () => {
      document.head.querySelectorAll('[data-seo]').forEach((el) => el.remove());
    };
  }, [title, description, canonical, image, type, noindex, jsonLdKey]);
};
