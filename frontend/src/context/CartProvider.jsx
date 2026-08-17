import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cartApi } from '../api/index.js';
import {
  getStoredCart,
  setStoredCart,
  clearStoredCart,
} from '../lib/storage.js';
import { useAuth } from './AuthProvider.jsx';
import { useToast } from './ToastProvider.jsx';

const CartContext = createContext(null);

/**
 * The browser holds only product ids and quantities. Every render of the cart is
 * priced by the server, so an item that was archived, sold out or repriced while
 * it sat in the cart is corrected rather than trusted.
 */
export const CartProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const mergedFor = useRef(null);

  const announceRemovals = useCallback(
    (removed) => {
      if (!removed?.length) return;
      const names = removed.map((r) => r.name).join(', ');
      toast.info(`${names} ${removed.length > 1 ? 'are' : 'is'} no longer available and was removed from your cart`);
    },
    [toast]
  );

  const apply = useCallback(
    (data) => {
      setItems(data.items);
      setStoredCart(data.items);
      announceRemovals(data.removed);
      return data.items;
    },
    [announceRemovals]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const stored = getStoredCart();

      if (isAuthenticated) {
        // Anything collected while browsing as a guest is folded into the
        // account's cart the first time we see this session authenticated.
        const { data } = stored.length
          ? await cartApi.merge(stored)
          : await cartApi.get();
        apply(data);
      } else {
        if (!stored.length) {
          setItems([]);
          return;
        }
        const { data } = await cartApi.validate(stored);
        apply(data);
      }
    } catch {
      // Leave the cart as-is rather than emptying it on a transient failure.
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, apply]);

  useEffect(() => {
    if (authLoading) return;

    const key = isAuthenticated ? 'user' : 'guest';
    if (mergedFor.current === key) return;
    mergedFor.current = key;

    refresh();
  }, [authLoading, isAuthenticated, refresh]);

  const persist = useCallback(
    async (next) => {
      setItems(next);
      setStoredCart(next);

      if (!isAuthenticated) {
        try {
          const { data } = await cartApi.validate(next);
          apply(data);
        } catch {
          /* keep the optimistic state */
        }
        return;
      }

      try {
        const { data } = await cartApi.replace(next);
        apply(data);
      } catch {
        /* keep the optimistic state */
      }
    },
    [isAuthenticated, apply]
  );

  const addItem = useCallback(
    async (product, quantity = 1) => {
      const existing = items.find((line) => line.product === product._id);
      const cap = Math.min(product.stock ?? 20, 20);

      const next = existing
        ? items.map((line) =>
            line.product === product._id
              ? { ...line, quantity: Math.min(line.quantity + quantity, cap) }
              : line
          )
        : [
            ...items,
            {
              product: product._id,
              productId: product._id,
              name: product.name,
              slug: product.slug,
              image: product.images?.[0]?.url ?? '',
              unitPrice: product.price,
              compareAtPrice: product.compareAtPrice,
              stock: product.stock,
              quantity: Math.min(quantity, cap),
              lineTotal: product.price * Math.min(quantity, cap),
            },
          ];

      await persist(next.map((l) => ({ ...l, productId: l.product })));
      toast.success(`${product.name} added to your cart`);
      setOpen(true);
    },
    [items, persist, toast]
  );

  const setQuantity = useCallback(
    (productId, quantity) =>
      persist(
        items.map((line) =>
          line.product === productId
            ? { ...line, productId, quantity, lineTotal: line.unitPrice * quantity }
            : { ...line, productId: line.product }
        )
      ),
    [items, persist]
  );

  const removeItem = useCallback(
    (productId) =>
      persist(
        items
          .filter((line) => line.product !== productId)
          .map((l) => ({ ...l, productId: l.product }))
      ),
    [items, persist]
  );

  const clear = useCallback(async () => {
    setItems([]);
    clearStoredCart();
    if (isAuthenticated) await cartApi.clear().catch(() => {});
  }, [isAuthenticated]);

  const { itemsTotal, itemCount } = useMemo(
    () => ({
      itemsTotal: items.reduce((sum, line) => sum + line.lineTotal, 0),
      itemCount: items.reduce((sum, line) => sum + line.quantity, 0),
    }),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      itemsTotal,
      itemCount,
      loading,
      open,
      openCart: () => setOpen(true),
      closeCart: () => setOpen(false),
      addItem,
      setQuantity,
      removeItem,
      clear,
      refresh,
    }),
    [
      items,
      itemsTotal,
      itemCount,
      loading,
      open,
      addItem,
      setQuantity,
      removeItem,
      clear,
      refresh,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside a CartProvider');
  return context;
};
