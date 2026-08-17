import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  EmptyState,
  ErrorState,
  Price,
  Skeleton,
  StatusPill,
} from '../../components/ui/Feedback.jsx';
import Button from '../../components/ui/Button.jsx';
import { ordersApi } from '../../api/index.js';
import { errorMessage } from '../../api/apiClient.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastProvider.jsx';
import { useConfirm } from '../../context/ConfirmProvider.jsx';
import { assetUrl } from '../../lib/images.js';
import { formatPrice, formatDate, formatDateTime } from '../../lib/format.js';
import { ORDER_STATUS_LABELS } from '../../constants/catalog.js';

const OrderDetail = () => {
  const { orderNumber } = useParams();
  const toast = useToast();
  const confirm = useConfirm();
  const [cancelling, setCancelling] = useState(false);

  const { data, loading, error, refetch } = useFetch(
    useCallback(() => ordersApi.mineByNumber(orderNumber), [orderNumber]),
    [orderNumber]
  );

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data?.order)
    return <EmptyState title="Order not found" description="Check the reference." />;

  const { order } = data;

  const cancel = async () => {
    const ok = await confirm({
      title: `Cancel ${order.orderNumber}?`,
      description:
        'The items go back into stock and the order cannot be reinstated. You would need to place a new one.',
      confirmLabel: 'Cancel order',
      cancelLabel: 'Keep it',
      destructive: true,
    });
    if (!ok) return;

    setCancelling(true);
    try {
      await ordersApi.cancelMine(order.orderNumber);
      toast.success('Your order has been cancelled');
      refetch();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-8">
      <Link
        to="/account/orders"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-dark-500 hover:text-primary-800">
        <ArrowLeft className="h-3.5 w-3.5" />
        All orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl">{order.orderNumber}</h2>
          <p className="text-sm text-dark-500">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill status={order.paymentStatus} />
          <StatusPill status={order.status} />
        </div>
      </div>

      {order.isCancellable && (
        <Button
          variant="outline"
          size="sm"
          onClick={cancel}
          loading={cancelling}
          className="border-danger-300 text-danger-600 hover:bg-danger-600 hover:text-white">
          Cancel this order
        </Button>
      )}

      <div className="border border-dark-200 bg-white/50">
        <ul className="divide-y divide-dark-200 px-6">
          {order.items.map((item) => (
            <li key={item.product} className="flex gap-4 py-5">
              <Link
                to={`/product/${item.slug}`}
                className="h-20 w-16 shrink-0 overflow-hidden bg-primary-50">
                <img
                  src={assetUrl(item.image)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/product/${item.slug}`}
                  className="text-sm hover:text-primary-700">
                  {item.name}
                </Link>
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

        <dl className="space-y-2.5 border-t border-dark-200 px-6 py-5 text-sm">
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
            <dt className="uppercase tracking-[0.12em]">Total</dt>
            <dd>
              <Price value={order.total} size="lg" />
            </dd>
          </div>
        </dl>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-[0.14em] text-dark-500">
            Delivery address
          </h3>
          <address className="text-sm not-italic leading-relaxed text-dark-700">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.addressLine1}
            {order.shippingAddress.addressLine2 && (
              <>
                <br />
                {order.shippingAddress.addressLine2}
              </>
            )}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.county}
            <br />
            {order.shippingAddress.phone}
          </address>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-[0.14em] text-dark-500">
            Progress
          </h3>
          <ol className="space-y-3">
            {order.statusHistory.map((entry, index) => (
              <li key={index} className="flex gap-3 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-600" />
                <div>
                  <p>{ORDER_STATUS_LABELS[entry.status] ?? entry.status}</p>
                  <p className="text-xs text-dark-500">
                    {formatDateTime(entry.changedAt)}
                  </p>
                  {entry.note && (
                    <p className="mt-0.5 text-xs text-dark-500">{entry.note}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
