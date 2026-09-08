import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import AppProviders from './AppProviders.jsx';
import './index.css';

const container = document.getElementById('root');

const tree = (
  <StrictMode>
    <BrowserRouter>
      <AppProviders>
        <App />
      </AppProviders>
    </BrowserRouter>
  </StrictMode>
);

/*
 * Hydrate what the build already rendered; mount fresh when there is nothing.
 *
 * `scripts/prerender.mjs` writes real markup into this element for the public
 * routes, and `createRoot().render()` would throw all of it away and rebuild
 * the DOM from scratch — turning the prerender from a faster first paint into
 * a slower one, since those bytes were downloaded and parsed for nothing.
 *
 * The check is on actual content rather than a flag, because both cases are
 * normal: a prerendered route arrives with markup, and anything served by
 * Netlify's SPA fallback (a product page, the account area) arrives empty.
 */
if (container.hasChildNodes()) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}
