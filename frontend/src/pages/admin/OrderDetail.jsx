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
import { Select, Textarea } from '../../components/ui/Field.jsx';
import { adminApi } from '../../api/index.js';
import { errorMessage } from '../../api/apiClient.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastProvider.jsx';
import { assetUrl } from '../../lib/images.js';
import { formatPrice, formatDate, formatDateTime } from '../../lib/format.js';
import {
  ORDER_STATUS_LABELS,
  ORDER_TRANSITIONS,
} from '../../constants/catalog.js';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const toast = useToast();
  const [nextStatus, setNextStatus] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const { data, loading, error, refetch } = useFetch(
    useCallback(() => adminApi.order(id), [id]),
    [id]
  );

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data?.order) return <EmptyState title="Order not found" />;

  const { order } = data;
  // Legal moves come from the same transition map the API validates against.
  const allowed = ORDER_TRANSITIONS[order.status] ?? [];

  const advance = async (event) => {
    event.preventDefault();
    if (!nextStatus) return;

    setSaving(true);
    try {
      await adminApi.setOrderStatus(id, { status: nextStatus, note });
      toast.success(`Order marked as ${ORDER_STATUS_LABELS[nextStatus]}`);
      setNextStatus('');
      setNote('');
      refetch();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-dark-500 hover:text-primary-800">
        <ArrowLeft className="h-3.5 w-3.5" />
        All orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl">{order.orderNumber}</h2>
          <p className="text-sm text-dark-500">
            Placed {formatDate(order.createdAt)} by{' '}
            {order.user?.name ?? 'a deleted user'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill status={order.paymentStatus} />
          <StatusPill status={order.status} />
        </div>
      </div>

      <section className="border border-dark-200 bg-white/50 p-6">
        <h3 className="text-xs uppercase tracking-[0.14em] text-dark-500">
          Update status
        </h3>
        {allowed.length === 0 ? (
          <p className="mt-3 text-sm text-dark-600">
            An order that is {order.status} is final and cannot be changed further.
          </p>
        ) : (
          <form onSubmit={advance} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Move to"
                value={nextStatus}
                onChange={(event) => setNextStatus(event.target.value)}>
                <option value="">Choose a status…</option>
                {allowed.map((status) => (
                  <option key={status} value={status}>
                    {ORDER_STATUS_LABELS[status]}
                  </option>
                ))}
              </Select>
            </div>
            <Textarea
              label="Note (optional)"
              rows={2}
              maxLength={300}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Courier reference, reason for cancellation, etc."
            />
            <Button type="submit" size="sm" loading={saving} disabled={!nextStatus}>
              Apply
            </Button>
            {nextStatus === 'cancelled' && (
              <p className="text-xs text-warning-700">
                Cancelling returns every item in this order to stock.
              </p>
            )}
          </form>
        )}
      </section>

      <div className="border border-dark-200 bg-white/50">
        <ul className="divide-y divide-dark-200 px-6">
          {order.items.map((item) => (
            <li key={item.product} className="flex gap-4 py-5">
              <img
                src={assetUrl(item.image)}
                alt=""
                className="h-20 w-16 shrink-0 object-cover"
              />
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

      <div className="grid gap-8 sm:grid-cols-3">
        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-[0.14em] text-dark-500">
            Deliver to
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
            <br />
            {order.shippingAddress.email}
          </address>
          {order.shippingAddress.deliveryNotes && (
            <p className="mt-2 border-l-2 border-primary-300 pl-3 text-xs italic text-dark-600">
              {order.shippingAddress.deliveryNotes}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-[0.14em] text-dark-500">
            Payment
          </h3>
          <dl className="space-y-1.5 text-sm text-dark-700">
            <div>
              <dt className="inline text-dark-500">Method: </dt>
              <dd className="inline">{order.paymentMethod}</dd>
            </div>
            <div>
              <dt className="inline text-dark-500">Status: </dt>
              <dd className="inline">{order.paymentStatus}</dd>
            </div>
            {order.paymentReference && (
              <div>
                <dt className="inline text-dark-500">Reference: </dt>
                <dd className="inline font-mono text-xs">
                  {order.paymentReference}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-[0.14em] text-dark-500">
            History
          </h3>
          <ol className="space-y-3">
            {order.statusHistory.map((entry, index) => (
              <li key={index} className="flex gap-3 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-600" />
                <div>
                  <p>{ORDER_STATUS_LABELS[entry.status] ?? entry.status}</p>
                  <p className="text-xs text-dark-500">
                    {formatDateTime(entry.changedAt)}
                    {entry.changedBy?.name && ` · ${entry.changedBy.name}`}
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

export default AdminOrderDetail;
