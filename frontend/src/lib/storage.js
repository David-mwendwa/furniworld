const TOKEN_KEY = 'furniworld:token';
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

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

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

export const clearStoredCart = () => localStorage.removeItem(CART_KEY);
