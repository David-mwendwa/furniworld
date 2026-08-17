import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import { Drawer } from '../ui/Overlay.jsx';
import Button from '../ui/Button.jsx';
import { EmptyState, Price, Skeleton } from '../ui/Feedback.jsx';
import { QuantityStepper } from '../ui/Controls.jsx';
import { useCart } from '../../context/CartProvider.jsx';
import { assetUrl } from '../../lib/images.js';
import { formatPrice } from '../../lib/format.js';
import { FREE_DELIVERY_THRESHOLD } from '../../constants/catalog.js';

const CartDrawer = () => {
  const {
    items,
    itemsTotal,
    itemCount,
    loading,
    open,
    closeCart,
    setQuantity,
    removeItem,
  } = useCart();
  const navigate = useNavigate();

  const remaining = FREE_DELIVERY_THRESHOLD - itemsTotal;

  return (
    <Drawer
      open={open}
      onClose={closeCart}
      title={`Your cart${itemCount ? ` (${itemCount})` : ''}`}
      footer={
        items.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-dark-600">Subtotal</span>
              <Price value={itemsTotal} size="lg" />
            </div>
            <p className="text-xs text-dark-500">
              Delivery and VAT are calculated at checkout.
            </p>
            <Button
              className="w-full"
              onClick={() => {
                closeCart();
                navigate('/checkout');
              }}>
              Checkout
            </Button>
            <Link
              to="/cart"
              onClick={closeCart}
              className="block text-center text-xs uppercase tracking-[0.14em] text-dark-500 underline">
              View full cart
            </Link>
          </div>
        )
      }>
      {loading && items.length === 0 ? (
        <div className="space-y-5">
          {[0, 1, 2].map((n) => (
            <div key={n} className="flex gap-4">
              <Skeleton className="h-24 w-20 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Browse the collection and add a piece to get started."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                closeCart();
                navigate('/shop');
              }}>
              Shop furniture
            </Button>
          }
          className="border-0"
        />
      ) : (
        <ul className="divide-y divide-dark-200">
          {items.map((line) => (
            <li key={line.product} className="flex gap-4 py-5 first:pt-0">
              <Link
                to={`/product/${line.slug}`}
                onClick={closeCart}
                className="h-24 w-20 shrink-0 overflow-hidden bg-primary-50">
                <img
                  src={assetUrl(line.image)}
                  alt={line.name}
                  className="h-full w-full object-cover"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to={`/product/${line.slug}`}
                    onClick={closeCart}
                    className="text-sm leading-snug transition-colors hover:text-primary-700">
                    {line.name}
                  </Link>
                  <button
                    onClick={() => removeItem(line.product)}
                    aria-label={`Remove ${line.name}`}
                    className="shrink-0 p-1 text-dark-400 transition-colors hover:text-danger-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <Price
                  value={line.unitPrice}
                  compareAt={line.compareAtPrice}
                  size="sm"
                />

                <div className="flex items-center justify-between gap-3">
                  <QuantityStepper
                    value={line.quantity}
                    max={Math.min(line.stock ?? 20, 20)}
                    onChange={(quantity) => setQuantity(line.product, quantity)}
                  />
                  <span className="text-sm font-medium tabular-nums">
                    {formatPrice(line.lineTotal)}
                  </span>
                </div>

                {line.quantity >= (line.stock ?? 20) && (
                  <p className="text-xs text-warning-700">
                    Only {line.stock} left in stock
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && remaining > 0 && (
        <div className="mt-6 border border-secondary-200 bg-secondary-50 px-4 py-3 text-xs text-secondary-800">
          Spend {formatPrice(remaining)} more for free delivery.
        </div>
      )}
    </Drawer>
  );
};

export default CartDrawer;
