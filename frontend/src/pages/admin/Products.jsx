import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Archive, Pencil } from 'lucide-react';
import {
  EmptyState,
  ErrorState,
  Skeleton,
  StatusPill,
} from '../../components/ui/Feedback.jsx';
import Button from '../../components/ui/Button.jsx';
import { Pagination } from '../../components/ui/Controls.jsx';
import { adminApi } from '../../api/index.js';
import { errorMessage } from '../../api/apiClient.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useToast } from '../../context/ToastProvider.jsx';
import { useConfirm } from '../../context/ConfirmProvider.jsx';
import { assetUrl } from '../../lib/images.js';
import { formatPrice } from '../../lib/format.js';
import { SUBCATEGORY_LABELS } from '../../constants/catalog.js';

const Products = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search);

  const params = { page, limit: 20, ...(debounced && { search: debounced }), ...(status && { status }) };
  const key = JSON.stringify(params);

  const { data, loading, error, refetch } = useFetch(
    useCallback(() => adminApi.products(params), [key]),
    [key]
  );

  const archive = async (product) => {
    const ok = await confirm({
      title: `Archive ${product.name}?`,
      description:
        'It disappears from the shop but stays attached to any existing orders. You can set it back to active later.',
      confirmLabel: 'Archive',
      destructive: true,
    });
    if (!ok) return;

    try {
      await adminApi.archiveProduct(product._id);
      toast.success('Product archived');
      refetch();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl">Products</h2>
          <p className="mt-1.5 text-sm text-dark-500">
            {data?.meta ? `${data.meta.total} in the catalogue` : ' '}
          </p>
        </div>
        <Button to="/admin/products/new" size="sm">
          <Plus className="h-4 w-4" />
          New product
        </Button>
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
            placeholder="Search by name or SKU"
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
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }, (_, n) => (
            <Skeleton key={n} className="h-16 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !data.products.length ? (
        <EmptyState
          title="No products match"
          description="Try a different search term or status filter."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-dark-300 text-left text-xs uppercase tracking-[0.12em] text-dark-500">
                <th className="pb-3 font-medium">Product</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 text-right font-medium">Price</th>
                <th className="pb-3 text-right font-medium">Stock</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-200">
              {data.products.map((product) => (
                <tr key={product._id}>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={assetUrl(product.images?.[0]?.url)}
                        alt=""
                        className="h-11 w-10 shrink-0 object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate">{product.name}</p>
                        <p className="text-xs text-dark-400">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-dark-600">
                    {SUBCATEGORY_LABELS[product.subcategory]}
                  </td>
                  <td className="py-3 text-right tabular-nums">
                    {formatPrice(product.price)}
                  </td>
                  <td className="py-3 text-right tabular-nums">
                    <span
                      className={
                        product.stock === 0
                          ? 'text-danger-600'
                          : product.stock <= product.lowStockThreshold
                            ? 'text-warning-700'
                            : ''
                      }>
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-3">
                    <StatusPill status={product.status} />
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        to={`/admin/products/${product._id}/edit`}
                        aria-label={`Edit ${product.name}`}
                        className="p-2 text-dark-500 transition-colors hover:text-primary-800">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      {product.status !== 'archived' && (
                        <button
                          onClick={() => archive(product)}
                          aria-label={`Archive ${product.name}`}
                          className="p-2 text-dark-500 transition-colors hover:text-danger-600">
                          <Archive className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data?.meta && (
        <Pagination
          page={data.meta.page}
          pages={data.meta.pages}
          onChange={setPage}
        />
      )}
    </div>
  );
};

export default Products;
