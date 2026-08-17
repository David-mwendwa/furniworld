import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShoppingCart, Package, Users, AlertTriangle } from 'lucide-react';
import {
  ErrorState,
  Price,
  Skeleton,
  StatusPill,
} from '../../components/ui/Feedback.jsx';
import { adminApi } from '../../api/index.js';
import { useFetch } from '../../hooks/useFetch.js';
import { assetUrl } from '../../lib/images.js';
import { formatPrice, formatDate } from '../../lib/format.js';

const StatCard = ({ icon: Icon, label, value, sub }) => (
  <div className="border border-dark-200 bg-white/50 p-6">
    <div className="flex items-start justify-between">
      <p className="text-xs uppercase tracking-[0.12em] text-dark-500">{label}</p>
      <Icon className="h-4 w-4 text-primary-600" />
    </div>
    <p className="mt-3 font-heading text-3xl font-semibold text-primary-950">
      {value}
    </p>
    {sub && <p className="mt-1 text-xs text-dark-500">{sub}</p>}
  </div>
);

const Overview = () => {
  const { data, loading, error, refetch } = useFetch(
    useCallback(() => adminApi.stats(), []),
    []
  );

  if (loading)
    return (
      <div className="space-y-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const { stats, salesByDay, topProducts, lowStock, recentOrders } = data;
  const peak = Math.max(...salesByDay.map((d) => d.revenue), 1);

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl">Overview</h2>
        <p className="mt-1.5 text-sm text-dark-500">
          Revenue counts orders that are processing, shipped or delivered.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={TrendingUp}
          label="Revenue"
          value={formatPrice(stats.revenue)}
          sub={`${formatPrice(stats.averageOrderValue)} average order`}
        />
        <StatCard
          icon={ShoppingCart}
          label="Orders"
          value={stats.paidOrders}
          sub={`${stats.orderCounts.pending ?? 0} awaiting action`}
        />
        <StatCard
          icon={Package}
          label="Active products"
          value={stats.productCount}
          sub={`${lowStock.length} low on stock`}
        />
        <StatCard
          icon={Users}
          label="Customers"
          value={stats.userCount}
          sub={`${stats.reviewCount} reviews published`}
        />
      </div>

      <section className="space-y-5">
        <h3 className="text-xs uppercase tracking-[0.14em] text-dark-500">
          Revenue, last 30 days
        </h3>
        {salesByDay.length === 0 ? (
          <p className="border border-dashed border-dark-300 px-6 py-10 text-center text-sm text-dark-500">
            No paid orders in the last 30 days.
          </p>
        ) : (
          <div className="flex h-40 items-end gap-1.5 border-b border-dark-200 pb-0">
            {salesByDay.map((day) => (
              <div
                key={day.date}
                className="group relative flex-1 bg-primary-300 transition-colors hover:bg-primary-600"
                style={{ height: `${(day.revenue / peak) * 100}%` }}>
                <span className="pointer-events-none absolute -top-9 left-1/2 hidden -translate-x-1/2 whitespace-nowrap bg-primary-950 px-2 py-1 text-[0.65rem] text-cream group-hover:block">
                  {day.date}: {formatPrice(day.revenue)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        <section className="space-y-4">
          <h3 className="text-xs uppercase tracking-[0.14em] text-dark-500">
            Best sellers
          </h3>
          {topProducts.length === 0 ? (
            <p className="text-sm text-dark-500">No sales yet.</p>
          ) : (
            <ul className="divide-y divide-dark-200 border-y border-dark-200">
              {topProducts.map((product) => (
                <li
                  key={product.slug}
                  className="flex items-center justify-between gap-4 py-3">
                  <Link
                    to={`/product/${product.slug}`}
                    className="min-w-0 flex-1 truncate text-sm hover:text-primary-700">
                    {product.name}
                  </Link>
                  <span className="shrink-0 text-xs text-dark-500">
                    {product.units} sold
                  </span>
                  <span className="shrink-0 text-sm tabular-nums">
                    {formatPrice(product.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <h3 className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-dark-500">
            <AlertTriangle className="h-3.5 w-3.5 text-warning-600" />
            Low stock
          </h3>
          {lowStock.length === 0 ? (
            <p className="text-sm text-dark-500">Everything is well stocked.</p>
          ) : (
            <ul className="divide-y divide-dark-200 border-y border-dark-200">
              {lowStock.map((product) => (
                <li key={product._id} className="flex items-center gap-3 py-3">
                  <img
                    src={assetUrl(product.images?.[0]?.url)}
                    alt=""
                    className="h-10 w-9 shrink-0 object-cover"
                  />
                  <Link
                    to={`/product/${product.slug}`}
                    className="min-w-0 flex-1 truncate text-sm hover:text-primary-700">
                    {product.name}
                  </Link>
                  <span className="shrink-0 text-xs text-warning-700">
                    {product.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-[0.14em] text-dark-500">
            Recent orders
          </h3>
          <Link
            to="/admin/orders"
            className="text-xs uppercase tracking-[0.12em] text-primary-800 underline">
            All orders
          </Link>
        </div>
        <ul className="divide-y divide-dark-200 border-y border-dark-200">
          {recentOrders.map((order) => (
            <li key={order._id} className="flex items-center gap-4 py-3.5">
              <Link
                to={`/admin/orders/${order._id}`}
                className="w-32 shrink-0 text-sm hover:text-primary-700">
                {order.orderNumber}
              </Link>
              <span className="min-w-0 flex-1 truncate text-sm text-dark-600">
                {order.user?.name ?? 'Deleted user'}
              </span>
              <span className="hidden shrink-0 text-xs text-dark-400 sm:block">
                {formatDate(order.createdAt)}
              </span>
              <StatusPill status={order.status} />
              <Price value={order.total} className="shrink-0" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Overview;
