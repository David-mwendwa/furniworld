import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Lock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Container, EmptyState, Price, Skeleton } from '../components/ui/Feedback.jsx';
import Button from '../components/ui/Button.jsx';
import { Stepper } from '../components/ui/Controls.jsx';
import { Input, Select, Textarea } from '../components/ui/Field.jsx';
import BankDetails from '../components/checkout/BankDetails.jsx';
import { ordersApi, paymentsApi } from '../api/index.js';
import { errorMessage } from '../api/apiClient.js';
import { useCart } from '../context/CartProvider.jsx';
import { useAuth } from '../context/AuthProvider.jsx';
import { useToast } from '../context/ToastProvider.jsx';
import { assetUrl } from '../lib/images.js';
import { formatPrice } from '../lib/format.js';
import { DELIVERY_NOTE } from '../constants/catalog.js';
import { COUNTIES, deliveryBandFor } from '../constants/counties.js';

const cardElementStyle = {
  style: {
    base: {
      fontFamily: 'Jost, sans-serif',
      fontSize: '14px',
      color: '#2b2622',
      '::placeholder': { color: '#9c9187' },
    },
    invalid: { color: '#b3452e' },
  },
};

/**
 * Card details are collected here rather than in the parent component because
 * `CardElement` and the Stripe hooks only work inside an `<Elements>` tree.
 * Card confirmation (including any 3D-Secure challenge) happens on submit,
 * against the order the parent has already created.
 */
const CardPaymentFields = ({ onCardChange }) => (
  <div className="border border-dark-300 bg-white/70 px-4 py-3.5">
    <CardElement options={cardElementStyle} onChange={onCardChange} />
  </div>
);

const Checkout = ({ config }) => {
  const { items, itemsTotal, clear } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

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
  const [paymentMethod, setPaymentMethod] = useState(
    () => config.methods.find((m) => m.enabled)?.id ?? ''
  );
  const [mpesaPhone, setMpesaPhone] = useState(user?.phone ?? '');
  const [cardComplete, setCardComplete] = useState(false);
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

  /**
   * Two phases: the order is created first, unpaid, and only then is money
   * actually moved against it. Cash on delivery and bank transfer stop there —
   * they stay `payment.status: pending` until a person confirms them.
   */
  const submit = async (event) => {
    event.preventDefault();
    if (!paymentMethod) return;
    if (paymentMethod === 'card' && (!stripe || !elements || !cardComplete)) {
      toast.error('Enter your card details');
      return;
    }

    setPlacing(true);
    try {
      const { data: created } = await ordersApi.create({
        shippingAddress: address,
        paymentMethod,
        items: items.map((line) => ({
          productId: line.product,
          quantity: line.quantity,
        })),
      });
      const order = created.order;

      if (paymentMethod === 'card') {
        const { paymentMethod: pm, error: pmError } = await stripe.createPaymentMethod({
          type: 'card',
          card: elements.getElement(CardElement),
          billing_details: { name: address.fullName, email: address.email },
        });
        if (pmError) throw new Error(pmError.message);

        const { data: result } = await paymentsApi.card({
          orderId: order._id,
          paymentMethodId: pm.id,
        });

        if (result.requiresAction) {
          const { error: actionError } = await stripe.confirmCardPayment(
            result.clientSecret
          );
          if (actionError) throw new Error(actionError.message);
        }
      } else if (paymentMethod === 'mpesa') {
        const { data: result } = await paymentsApi.mpesa({
          orderId: order._id,
          phone: mpesaPhone,
        });
        toast.success(result.message);
      }

      await clear();
      navigate(`/checkout/success/${order.orderNumber}`, { replace: true });
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setPlacing(false);
    }
  };

  const submitLabel = useMemo(() => {
    if (paymentMethod === 'card') return 'Pay and place order';
    if (paymentMethod === 'mpesa') return 'Pay with M-Pesa';
    return 'Place order';
  }, [paymentMethod]);

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
              {config.methods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-start gap-4 border px-5 py-4 transition-colors ${
                    !method.enabled
                      ? 'cursor-not-allowed border-dark-200 opacity-50'
                      : paymentMethod === method.id
                        ? 'cursor-pointer border-primary-700 bg-primary-50'
                        : 'cursor-pointer border-dark-200 hover:border-dark-300'
                  }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    disabled={!method.enabled}
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

            {paymentMethod === 'card' && (
              <CardPaymentFields
                onCardChange={(event) => setCardComplete(event.complete)}
              />
            )}

            {paymentMethod === 'mpesa' && (
              <Input
                label="M-Pesa phone number"
                required
                value={mpesaPhone}
                onChange={(event) => setMpesaPhone(event.target.value)}
                placeholder="0712345678"
                hint={
                  config.config.mpesaSimulated
                    ? "The Daraja sandbox can't approve a real push, so this demo settles it locally moments after sending."
                    : "We'll send a prompt to this number."
                }
              />
            )}

            {paymentMethod === 'bank_transfer' && (
              <div>
                <BankDetails />
                <p className="mt-2 text-xs text-dark-500">
                  Your order number appears once you place the order below —
                  use that as the reference.
                </p>
              </div>
            )}

            <p className="flex items-center gap-2 text-xs text-dark-500">
              <Lock className="h-3.5 w-3.5" />
              Card payments run in Stripe test mode; nothing is really charged.
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
              disabled={!quote || !paymentMethod}>
              {submitLabel}
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

let stripePromise;
const getStripe = (key) => {
  if (!stripePromise) stripePromise = key ? loadStripe(key) : Promise.resolve(null);
  return stripePromise;
};

/**
 * `CardElement`/`useStripe`/`useElements` only work inside an `<Elements>`
 * ancestor, and the key it loads Stripe.js with comes from the server — not a
 * separate frontend env var — so the deployed key can never drift from the one
 * `/payments/config` used to decide whether card is even offered. That means
 * fetching config here, before anything renders, rather than inside
 * `Checkout` itself.
 */
const CheckoutWithStripe = () => {
  const toast = useToast();
  const [config, setConfig] = useState(null);

  useEffect(() => {
    paymentsApi
      .config()
      .then(({ data }) => setConfig(data))
      .catch(() => toast.error('Could not load payment options'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!config)
    return (
      <Container className="py-14">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="mt-8 h-96 w-full" />
      </Container>
    );

  return (
    <Elements stripe={getStripe(config.config.stripePublishableKey)}>
      <Checkout config={config} />
    </Elements>
  );
};

export default CheckoutWithStripe;
