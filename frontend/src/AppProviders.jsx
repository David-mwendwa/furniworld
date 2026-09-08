import { ToastProvider } from './context/ToastProvider.jsx';
import { ConfirmProvider } from './context/ConfirmProvider.jsx';
import { AuthProvider } from './context/AuthProvider.jsx';
import { CartProvider } from './context/CartProvider.jsx';

/**
 * Every provider the app needs, in the order it needs them, with no router.
 *
 * It lives in its own file because the build renders this tree a second time,
 * under a `MemoryRouter` rather than a `BrowserRouter`, to prerender the public
 * routes (see `scripts/prerender.mjs`). Two hand-maintained copies of a
 * five-deep provider nest is how prerendered HTML ends up subtly different from
 * what the browser hydrates — a missing provider there is a crash, and a
 * differently-ordered one is worse, because it renders.
 *
 * The router stays outside deliberately: it is the one piece that differs
 * between the two callers, and `BrowserRouter` reads `document` the moment it
 * is constructed, so a tree with one baked in cannot be built in Node at all.
 */
const AppProviders = ({ children }) => (
  <ToastProvider>
    <ConfirmProvider>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </ConfirmProvider>
  </ToastProvider>
);

export default AppProviders;
