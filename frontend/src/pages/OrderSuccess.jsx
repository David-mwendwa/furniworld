import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Truck } from 'lucide-react';
import { Container, Price, Skeleton, StatusPill, EmptyState } from '../components/ui/Feedback.jsx';
import Button from '../components/ui/Button.jsx';
import { Stepper } from '../components/ui/Controls.jsx';
import { ordersApi } from '../api/index.js';
import { useFetch } from '../hooks/useFetch.js';
import { assetUrl } from '../lib/images.js';
import { formatPrice, formatDate } from '../lib/format.js';
import { paymentLabel } from '../lib/payment.js';
import { DELIVERY_NOTE } from '../constants/catalog.js';
import { deliveryBandFor } from '../constants/counties.js';

const OrderSuccess = () => {
  const { orderNumber } = useParams();
  const { data, loading, error } = useFetch(
    useCallback(() => ordersApi.mineByNumber(orderNumber), [orderNumber]),
    [orderNumber]
  );

  if (loading)
    return (
      <Container className="max-w-3xl py-20">
        <Skeleton className="mx-auto h-12 w-12 rounded-full" />
        <Skeleton className="mx-auto mt-6 h-10 w-2/3" />
        <Skeleton className="mt-10 h-64 w-full" />
      </Container>
    );

  if (error || !data?.order)
    return (
      <Container className="py-20">
        <EmptyState
          title="We could not find that order"
          description={error}
          action={<Button to="/account/orders">Your orders</Button>}
        />
      </Container>
    );

  const { order } = data;

  return (
    <Container className="max-w-3xl py-14">
      <div className="text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-success-100 text-success-700">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h1 className="mt-6 text-display-sm lg:text-4xl">Thank you — order placed</h1>
        <p className="mt-3 text-sm text-dark-600">
          A confirmation is on its way to {order.shippingAddress.email}. Your
          order reference is{' '}
          <span className="font-medium text-primary-900">{order.orderNumber}</span>.
        </p>
      </div>

      <Stepper
        className="mt-10 justify-center"
        steps={['Cart', 'Details', 'Done']}
        current={2}
      />

      <div className="mt-12 border border-dark-200 bg-white/50">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-dark-200 px-7 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-dark-500">
              Placed {formatDate(order.createdAt)}
            </p>
            <p className="mt-1 text-sm">{order.itemCount} item(s)</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill status={order.payment.status} label={paymentLabel(order.payment.status)} />
            <StatusPill status={order.status} />
          </div>
        </div>

        <ul className="divide-y divide-dark-200 px-7">
          {order.items.map((item) => (
            <li key={item.product} className="flex gap-4 py-5">
              <img
                src={assetUrl(item.image)}
                alt=""
                className="h-20 w-16 shrink-0 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm">{item.name}</p>
                <p className="mt-1 text-xs text-dark-500">
                  {item.quantity} × {formatPrice(item.unitPrice)}
                </p>
              </div>
              <span className="text-sm tabular-nums">
                {formatPrice(item.lineTotal)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="space-y-2.5 border-t border-dark-200 px-7 py-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-dark-600">Items</dt>
            <dd className="tabular-nums">{formatPrice(order.itemsTotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-dark-600">Delivery</dt>
            <dd className="tabular-nums">
              {order.deliveryFee === 0 ? 'Free' : formatPrice(order.deliveryFee)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-dark-600">VAT</dt>
            <dd className="tabular-nums">{formatPrice(order.tax)}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-dark-200 pt-3">
            <dt className="text-sm uppercase tracking-[0.12em]">Total</dt>
            <dd>
              <Price value={order.total} size="lg" />
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 flex items-start gap-3 border border-secondary-200 bg-secondary-50 px-6 py-4 text-sm text-secondary-900">
        <Truck className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          {DELIVERY_NOTE[deliveryBandFor(order.shippingAddress.county)]}. We will
          call {order.shippingAddress.phone} before the driver sets off.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Button to={`/account/orders/${order.orderNumber}`} variant="outline">
          Track this order
        </Button>
        <Button to="/shop">Keep shopping</Button>
      </div>
    </Container>
  );
};

export default OrderSuccess;
