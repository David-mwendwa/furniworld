import { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Lock } from 'lucide-react';
import { Container, EmptyState, Price } from '../components/ui/Feedback.jsx';
import Button from '../components/ui/Button.jsx';
import { Stepper } from '../components/ui/Controls.jsx';
import { Input, Select, Textarea } from '../components/ui/Field.jsx';
import { ordersApi } from '../api/index.js';
import { errorMessage } from '../api/apiClient.js';
import { useCart } from '../context/CartProvider.jsx';
import { useAuth } from '../context/AuthProvider.jsx';
import { useToast } from '../context/ToastProvider.jsx';
import { assetUrl } from '../lib/images.js';
import { formatPrice } from '../lib/format.js';
import { PAYMENT_METHODS, DELIVERY_NOTE } from '../constants/catalog.js';
import { COUNTIES, deliveryBandFor } from '../constants/counties.js';

const Checkout = () => {
  const { items, itemsTotal, clear } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: user?.name ?? '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
    addressLine1: '',
    addressLine2: '',
    city: 'Nairobi',
    county: 'Nairobi',
    postalCode: '',
    deliveryNotes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('mpesa-simulated');
  const [quote, setQuote] = useState(null);
  const [placing, setPlacing] = useState(false);

  const set = (field) => (event) =>
    setAddress((current) => ({ ...current, [field]: event.target.value }));

  // Totals are quoted by the server so the figures shown are the figures charged.
  const fetchQuote = useCallback(async () => {
    if (!items.length) return;
    try {
      const { data } = await ordersApi.quote({
        items: items.map((line) => ({
          productId: line.product,
          quantity: line.quantity,
        })),
        county: address.county,
      });
      setQuote(data);
    } catch (error) {
      toast.error(errorMessage(error));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, address.county]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  const submit = async (event) => {
    event.preventDefault();
    setPlacing(true);
    try {
      const { data } = await ordersApi.create({
        shippingAddress: address,
        paymentMethod,
        items: items.map((line) => ({
          productId: line.product,
          quantity: line.quantity,
        })),
      });
      await clear();
      navigate(`/checkout/success/${data.order.orderNumber}`, { replace: true });
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setPlacing(false);
    }
  };

  if (!items.length)
    return (
      <Container className="py-20">
        <EmptyState
          icon={ShoppingBag}
          title="There is nothing to check out"
          description="Add a piece to your cart and come back."
          action={<Button to="/shop">Shop furniture</Button>}
        />
      </Container>
    );

  return (
    <Container className="py-10 lg:py-14">
      <Stepper steps={['Cart', 'Details', 'Done']} current={1} />
      <h1 className="mt-7 text-display-sm lg:text-5xl">Checkout</h1>

      <form
        onSubmit={submit}
        className="mt-12 grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-16">
        <div className="space-y-12">
          <section className="space-y-6">
            <h2 className="font-sans text-sm font-medium uppercase tracking-[0.16em]">
              Delivery address
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Full name"
                required
                value={address.fullName}
                onChange={set('fullName')}
              />
              <Input
                label="Phone"
                required
                value={address.phone}
                onChange={set('phone')}
                placeholder="0712345678"
                hint="Kenyan mobile number"
              />
              <Input
                label="Email"
                type="email"
                required
                value={address.email}
                onChange={set('email')}
                className="sm:col-span-2"
              />
              <Input
                label="Address"
                required
                value={address.addressLine1}
                onChange={set('addressLine1')}
                placeholder="Estate, street or building"
                className="sm:col-span-2"
              />
              <Input
                label="Apartment, floor (optional)"
                value={address.addressLine2}
                onChange={set('addressLine2')}
                className="sm:col-span-2"
              />
              <Input
                label="Town or city"
                required
                value={address.city}
                onChange={set('city')}
              />
              <Select
                label="County"
                required
                value={address.county}
                onChange={set('county')}
                options={COUNTIES.map((county) => ({
                  value: county,
                  label: county,
                }))}
              />
              <Input
                label="Postal code (optional)"
                value={address.postalCode}
                onChange={set('postalCode')}
              />
              <Textarea
                label="Delivery notes (optional)"
                value={address.deliveryNotes}
                onChange={set('deliveryNotes')}
                rows={3}
                maxLength={300}
                placeholder="Gate code, landmark, best time to deliver"
                className="sm:col-span-2"
              />
            </div>
            <p className="text-xs text-secondary-800">
              {DELIVERY_NOTE[deliveryBandFor(address.county)]}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-sans text-sm font-medium uppercase tracking-[0.16em]">
              Payment
            </h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.value}
                  className={`flex cursor-pointer items-start gap-4 border px-5 py-4 transition-colors ${
                    paymentMethod === method.value
                      ? 'border-primary-700 bg-primary-50'
                      : 'border-dark-200 hover:border-dark-300'
                  }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    className="mt-0.5 text-primary-700 focus:ring-secondary-600"
                  />
                  <span className="space-y-0.5">
                    <span className="block text-sm font-medium">{method.label}</span>
                    <span className="block text-xs text-dark-500">
                      {method.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <p className="flex items-center gap-2 text-xs text-dark-500">
              <Lock className="h-3.5 w-3.5" />
              This is a portfolio project — no real payment is taken and no order
              is fulfilled.
            </p>
          </section>
        </div>

        <aside className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:h-fit">
          <div className="space-y-5 border border-dark-200 bg-white/50 p-7">
            <h2 className="font-sans text-sm font-medium uppercase tracking-[0.16em]">
              Order summary
            </h2>

            <ul className="max-h-72 space-y-4 overflow-y-auto">
              {items.map((line) => (
                <li key={line.product} className="flex gap-3">
                  <img
                    src={assetUrl(line.image)}
                    alt=""
                    className="h-16 w-14 shrink-0 object-cover"
                  />
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="truncate">{line.name}</p>
                    <p className="text-xs text-dark-500">
                      {line.quantity} × {formatPrice(line.unitPrice)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm tabular-nums">
                    {formatPrice(line.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="space-y-3 border-t border-dark-200 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-dark-600">Items</dt>
                <dd className="tabular-nums">
                  {formatPrice(quote?.itemsTotal ?? itemsTotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-dark-600">Delivery</dt>
                <dd className="tabular-nums">
                  {quote
                    ? quote.deliveryFee === 0
                      ? 'Free'
                      : formatPrice(quote.deliveryFee)
                    : '—'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-dark-600">VAT (16%)</dt>
                <dd className="tabular-nums">
                  {quote ? formatPrice(quote.tax) : '—'}
                </dd>
              </div>
            </dl>

            <div className="flex items-baseline justify-between border-t border-dark-200 pt-4">
              <span className="text-sm uppercase tracking-[0.12em]">Total</span>
              <Price value={quote?.total ?? itemsTotal} size="lg" />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={placing}
              disabled={!quote}>
              Place order
            </Button>
            <Link
              to="/cart"
              className="block text-center text-xs uppercase tracking-[0.14em] text-dark-500 underline">
              Back to cart
            </Link>
          </div>
        </aside>
      </form>
    </Container>
  );
};

export default Checkout;
