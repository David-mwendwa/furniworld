import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Trash2 } from 'lucide-react';
import {
  EmptyState,
  ErrorState,
  Rating,
  Skeleton,
} from '../../components/ui/Feedback.jsx';
import Button from '../../components/ui/Button.jsx';
import { reviewsApi } from '../../api/index.js';
import { errorMessage } from '../../api/apiClient.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastProvider.jsx';
import { useConfirm } from '../../context/ConfirmProvider.jsx';
import { assetUrl } from '../../lib/images.js';
import { formatRelative } from '../../lib/format.js';

const MyReviews = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [removing, setRemoving] = useState(null);

  const { data, loading, error, refetch } = useFetch(
    useCallback(() => reviewsApi.mine(), []),
    []
  );

  if (loading) return <Skeleton className="h-64 w-full" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const reviews = data?.reviews ?? [];

  if (!reviews.length)
    return (
      <EmptyState
        icon={Star}
        title="You have not reviewed anything yet"
        description="Once a piece has been delivered, tell other shoppers how it worked out."
        action={<Button to="/account/orders">Your orders</Button>}
      />
    );

  const remove = async (review) => {
    const ok = await confirm({
      title: 'Delete this review?',
      description: 'It will be removed from the product page immediately.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;

    setRemoving(review._id);
    try {
      await reviewsApi.remove(review._id);
      toast.success('Review deleted');
      refetch();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <article
          key={review._id}
          className="flex gap-5 border border-dark-200 bg-white/50 p-6">
          {review.product?.images?.[0] && (
            <Link
              to={`/product/${review.product.slug}`}
              className="h-20 w-16 shrink-0 overflow-hidden bg-primary-50">
              <img
                src={assetUrl(review.product.images[0].url)}
                alt=""
                className="h-full w-full object-cover"
              />
            </Link>
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <Link
                to={`/product/${review.product?.slug}`}
                className="text-sm font-medium hover:text-primary-700">
                {review.product?.name}
              </Link>
              <button
                onClick={() => remove(review)}
                disabled={removing === review._id}
                aria-label="Delete review"
                className="shrink-0 p-1 text-dark-400 transition-colors hover:text-danger-600 disabled:opacity-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <Rating value={review.rating} size={12} count={0} showEmpty={false} />
              <span className="text-xs text-dark-400">
                {formatRelative(review.createdAt)}
              </span>
            </div>
            {review.title && <p className="text-sm font-medium">{review.title}</p>}
            <p className="text-sm leading-relaxed text-dark-600">{review.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
};

export default MyReviews;
