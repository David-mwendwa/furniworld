import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import {
  EmptyState,
  ErrorState,
  Price,
  Skeleton,
  StatusPill,
} from '../../components/ui/Feedback.jsx';
import { Pagination } from '../../components/ui/Controls.jsx';
import { adminApi } from '../../api/index.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { formatDate } from '../../lib/format.js';
import { ORDER_STATUS_LABELS } from '../../constants/catalog.js';

const AdminOrders = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search);

  const params = {
    page,
    limit: 20,
    ...(debounced && { search: debounced }),
    ...(status && { status }),
  };
  const key = JSON.stringify(params);

  const { data, loading, error, refetch } = useFetch(
    useCallback(() => adminApi.orders(params), [key]),
    [key]
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl">Orders</h2>
        <p className="mt-1.5 text-sm text-dark-500">
          {data?.meta ? `${data.meta.total} order(s)` : ' '}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by order number or customer"
            className="h-11 w-full border-dark-300 bg-white/70 pl-10 text-sm focus:border-primary-600 focus:ring-0"
          />
        </div>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          aria-label="Filter by status"
          className="h-11 border-dark-300 bg-white/70 text-sm focus:border-primary-600 focus:ring-0">
          <option value="">All statuses</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }, (_, n) => (
            <Skeleton key={n} className="h-14 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !data.orders.length ? (
        <EmptyState
          title="No orders match"
          description="Try a different search term or status."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-dark-300 text-left text-xs uppercase tracking-[0.12em] text-dark-500">
                <th className="pb-3 font-medium">Order</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Placed</th>
                <th className="pb-3 font-medium">Payment</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-200">
              {data.orders.map((order) => (
                <tr key={order._id} className="transition-colors hover:bg-primary-50/60">
                  <td className="py-3.5">
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className="font-medium hover:text-primary-700">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3.5 text-dark-600">
                    {order.user?.name ?? 'Deleted user'}
                  </td>
                  <td className="py-3.5 text-dark-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="py-3.5">
                    <StatusPill status={order.paymentStatus} />
                  </td>
                  <td className="py-3.5">
                    <StatusPill status={order.status} />
                  </td>
                  <td className="py-3.5 text-right">
                    <Price value={order.total} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data?.meta && (
        <Pagination page={data.meta.page} pages={data.meta.pages} onChange={setPage} />
      )}
    </div>
  );
};

export default AdminOrders;
