import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import {
  EmptyState,
  ErrorState,
  Price,
  Skeleton,
  StatusPill,
} from '../../components/ui/Feedback.jsx';
import Button from '../../components/ui/Button.jsx';
import { ordersApi } from '../../api/index.js';
import { useFetch } from '../../hooks/useFetch.js';
import { formatDate } from '../../lib/format.js';

const Orders = () => {
  const { data, loading, error, refetch } = useFetch(
    useCallback(() => ordersApi.mine({ limit: 20 }), []),
    []
  );

  if (loading)
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((n) => (
          <Skeleton key={n} className="h-24 w-full" />
        ))}
      </div>
    );

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const orders = data?.orders ?? [];

  if (!orders.length)
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        description="Once you place an order it will show up here with its delivery status."
        action={<Button to="/shop">Shop furniture</Button>}
      />
    );

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Link
          key={order._id}
          to={`/account/orders/${order.orderNumber}`}
          className="group flex items-center gap-5 border border-dark-200 bg-white/50 px-6 py-5 transition-colors hover:border-primary-300">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium">{order.orderNumber}</span>
              <StatusPill status={order.status} />
            </div>
            <p className="text-xs text-dark-500">
              {formatDate(order.createdAt)} · {order.itemCount} item
              {order.itemCount === 1 ? '' : 's'}
            </p>
          </div>
          <Price value={order.total} />
          <ChevronRight className="h-4 w-4 shrink-0 text-dark-400 transition-transform group-hover:translate-x-1" />
        </Link>
      ))}
    </div>
  );
};

export default Orders;
