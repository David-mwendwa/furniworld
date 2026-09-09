/**
 * Removes the host's marketing tags from HTML responses.
 *
 * Netlify's edge injects two things into every page served from a
 * *.netlify.app address — an HTML comment ("This site is hosted on Netlify…")
 * and a `<meta name="netlify-deploy">`, both carrying `utm_campaign=ai-legible`
 * — plus a matching `netlify-hosting` response header. None of it is in the
 * build: `dist/index.html` is clean, and the tags appear only once the page is
 * served, which is why no build-time strip reaches them.
 *
 * This runs after the origin response is assembled and rewrites the HTML on the
 * way out. It is deliberately narrow: it matches those two tags by their own
 * markers and touches nothing else, so a page with neither passes through
 * byte-identical apart from being re-serialised.
 *
 * Only text/html is read. Everything else — assets, JSON, images — is returned
 * untouched, without being buffered.
 */

const COMMENT = /\s*<!--[^>]*?hosted on Netlify[\s\S]*?-->/g;
const META = /\s*<meta\s+name="netlify-deploy"[^>]*>/gi;

export default async (request, context) => {
  const response = await context.next();

  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html')) return response;

  const original = await response.text();
  const cleaned = original.replace(COMMENT, '').replace(META, '');

  const headers = new Headers(response.headers);
  headers.delete('netlify-hosting');
  // The body changed length, and a stale content-length truncates the page.
  headers.delete('content-length');

  return new Response(cleaned, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export const config = { path: '/*' };
