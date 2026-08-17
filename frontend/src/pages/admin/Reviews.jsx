import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import {
  EmptyState,
  ErrorState,
  Rating,
  Skeleton,
  StatusPill,
  Badge,
} from '../../components/ui/Feedback.jsx';
import { Pagination } from '../../components/ui/Controls.jsx';
import { adminApi } from '../../api/index.js';
import { errorMessage } from '../../api/apiClient.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastProvider.jsx';
import { formatDate } from '../../lib/format.js';

const AdminReviews = () => {
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(null);

  const params = { page, limit: 20, ...(status && { status }) };
  const key = JSON.stringify(params);

  const { data, loading, error, refetch } = useFetch(
    useCallback(() => adminApi.reviews(params), [key]),
    [key]
  );

  const toggle = async (review) => {
    const next = review.status === 'published' ? 'hidden' : 'published';
    setBusy(review._id);
    try {
      await adminApi.setReviewStatus(review._id, next);
      toast.success(next === 'hidden' ? 'Review hidden' : 'Review published');
      refetch();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl">Reviews</h2>
        <p className="mt-1.5 text-sm text-dark-500">
          Hiding a review removes it from the product page and recalculates that
          product's rating.
        </p>
      </div>

      <select
        value={status}
        onChange={(event) => {
          setStatus(event.target.value);
          setPage(1);
        }}
        aria-label="Filter by status"
        className="h-11 max-w-[200px] border-dark-300 bg-white/70 text-sm focus:border-primary-600 focus:ring-0">
        <option value="">All reviews</option>
        <option value="published">Published</option>
        <option value="hidden">Hidden</option>
      </select>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, n) => (
            <Skeleton key={n} className="h-28 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !data.reviews.length ? (
        <EmptyState title="No reviews yet" />
      ) : (
        <ul className="space-y-3">
          {data.reviews.map((review) => (
            <li
              key={review._id}
              className="space-y-2.5 border border-dark-200 bg-white/50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <Link
                    to={`/product/${review.product?.slug}`}
                    className="text-sm font-medium hover:text-primary-700">
                    {review.product?.name ?? 'Deleted product'}
                  </Link>
                  <div className="flex flex-wrap items-center gap-3">
                    <Rating
                      value={review.rating}
                      size={12}
                      count={0}
                      showEmpty={false}
                    />
                    {review.verifiedPurchase && (
                      <Badge tone="sage">Verified</Badge>
                    )}
                    <StatusPill status={review.status} />
                    <span className="text-xs text-dark-400">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggle(review)}
                  disabled={busy === review._id}
                  className="inline-flex items-center gap-2 border border-dark-300 px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-dark-600 transition-colors hover:border-primary-400 hover:text-primary-800 disabled:opacity-50">
                  {review.status === 'published' ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      Publish
                    </>
                  )}
                </button>
              </div>

              {review.title && <p className="text-sm font-medium">{review.title}</p>}
              <p className="text-sm leading-relaxed text-dark-600">{review.body}</p>
              <p className="text-xs text-dark-400">by {review.user?.name}</p>
            </li>
          ))}
        </ul>
      )}

      {data?.meta && (
        <Pagination page={data.meta.page} pages={data.meta.pages} onChange={setPage} />
      )}
    </div>
  );
};

export default AdminReviews;
