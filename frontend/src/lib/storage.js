const TOKEN_KEY = 'furniworld:token';
const USER_KEY = 'furniworld:user';
const CART_KEY = 'furniworld:cart';

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // A full or blocked localStorage should not break the page.
  }
};

/*
 * The raw accessors are wrapped the same way `read`/`write` are.
 *
 * `localStorage` is not merely empty outside a browser, it is undefined, and
 * touching an undefined global throws rather than returning nothing — so a
 * bare `localStorage.getItem` here brings down the whole render when the build
 * prerenders these routes in Node (see scripts/prerender.mjs). The same wrap
 * covers a browser that has blocked site data, where every access throws too.
 */
const rawRead = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const rawWrite = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Full, blocked, or no storage at all — the in-memory state is still right
    // for this session.
  }
};

const rawRemove = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Nothing to clean up if it cannot be reached.
  }
};

export const getToken = () => rawRead(TOKEN_KEY);
export const setToken = (token) => rawWrite(TOKEN_KEY, token);
export const clearToken = () => rawRemove(TOKEN_KEY);

// A last-known copy of the signed-in user, purely so the navbar can render the
// right state on the very first paint after a refresh instead of guessing
// "signed out" until `/auth/me` answers — it is never trusted for anything
// that matters, only overwritten or discarded once that response lands.
export const getStoredUser = () => read(USER_KEY, null);
export const setStoredUser = (user) => write(USER_KEY, user);
export const clearStoredUser = () => rawRemove(USER_KEY);

// Only product ids and quantities are persisted — never prices, so a stale cart
// can never be used to buy at an old price.
export const getStoredCart = () => {
  const items = read(CART_KEY, []);
  return Array.isArray(items) ? items : [];
};

// Server responses name the id `product` while local additions use `productId`,
// so both are accepted — reading only one silently stored ids as undefined and
// emptied the cart on the next load.
export const setStoredCart = (items) =>
  write(
    CART_KEY,
    items
      .map((item) => ({
        productId: item.productId ?? item.product,
        quantity: item.quantity,
      }))
      .filter((item) => item.productId)
  );

export const clearStoredCart = () => rawRemove(CART_KEY);
