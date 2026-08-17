import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import { Container, EmptyState, Price, Skeleton } from '../components/ui/Feedback.jsx';
import Button from '../components/ui/Button.jsx';
import { QuantityStepper, Breadcrumbs } from '../components/ui/Controls.jsx';
import { useCart } from '../context/CartProvider.jsx';
import { assetUrl } from '../lib/images.js';
import { formatPrice } from '../lib/format.js';
import { FREE_DELIVERY_THRESHOLD } from '../constants/catalog.js';

const Cart = () => {
  const { items, itemsTotal, itemCount, loading, setQuantity, removeItem } =
    useCart();

  const remaining = FREE_DELIVERY_THRESHOLD - itemsTotal;

  return (
    <Container className="py-10 lg:py-14">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />
      <h1 className="mt-6 text-display-sm lg:text-5xl">Your cart</h1>

      {loading && items.length === 0 ? (
        <div className="mt-12 space-y-6">
          {[0, 1, 2].map((n) => (
            <div key={n} className="flex gap-6 border-b border-dark-200 pb-6">
              <Skeleton className="h-32 w-28 shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          className="mt-12"
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Nothing here yet. Have a look through the collection and add something you like."
          action={<Button to="/shop">Shop furniture</Button>}
        />
      ) : (
        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
          <ul className="divide-y divide-dark-200 border-y border-dark-200">
            {items.map((line) => (
              <li key={line.product} className="flex gap-6 py-6">
                <Link
                  to={`/product/${line.slug}`}
                  className="h-32 w-28 shrink-0 overflow-hidden bg-primary-50">
                  <img
                    src={assetUrl(line.image)}
                    alt={line.name}
                    className="h-full w-full object-cover"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <Link
                        to={`/product/${line.slug}`}
                        className="text-base leading-snug transition-colors hover:text-primary-700">
                        {line.name}
                      </Link>
                      <Price
                        value={line.unitPrice}
                        compareAt={line.compareAtPrice}
                        size="sm"
                      />
                    </div>
                    <button
                      onClick={() => removeItem(line.product)}
                      aria-label={`Remove ${line.name}`}
                      className="shrink-0 p-1 text-dark-400 transition-colors hover:text-danger-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <QuantityStepper
                      value={line.quantity}
                      max={Math.min(line.stock ?? 20, 20)}
                      onChange={(quantity) => setQuantity(line.product, quantity)}
                    />
                    <span className="text-base font-medium tabular-nums">
                      {formatPrice(line.lineTotal)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:h-fit">
            <div className="space-y-5 border border-dark-200 bg-white/50 p-7">
              <h2 className="font-sans text-sm font-medium uppercase tracking-[0.16em]">
                Summary
              </h2>

              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-dark-600">
                    Items ({itemCount})
                  </dt>
                  <dd className="tabular-nums">{formatPrice(itemsTotal)}</dd>
                </div>
                <div className="flex justify-between text-dark-500">
                  <dt>Delivery and VAT</dt>
                  <dd>Calculated at checkout</dd>
                </div>
              </dl>

              <div className="flex items-baseline justify-between border-t border-dark-200 pt-4">
                <span className="text-sm uppercase tracking-[0.12em]">
                  Subtotal
                </span>
                <Price value={itemsTotal} size="lg" />
              </div>

              {remaining > 0 && (
                <p className="border border-secondary-200 bg-secondary-50 px-4 py-3 text-xs text-secondary-800">
                  Spend {formatPrice(remaining)} more for free delivery.
                </p>
              )}

              <Button to="/checkout" size="lg" className="w-full">
                Proceed to checkout
              </Button>
              <Link
                to="/shop"
                className="block text-center text-xs uppercase tracking-[0.14em] text-dark-500 underline">
                Continue shopping
              </Link>
            </div>
          </aside>
        </div>
      )}
    </Container>
  );
};

export default Cart;
