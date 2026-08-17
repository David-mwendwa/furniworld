import { useState } from 'react';
import { MessageSquare, BadgeCheck } from 'lucide-react';
import Button from '../ui/Button.jsx';
import { Rating, EmptyState, Badge } from '../ui/Feedback.jsx';
import { Textarea, Input } from '../ui/Field.jsx';
import { formatRelative } from '../../lib/format.js';
import { productsApi } from '../../api/index.js';
import { errorMessage } from '../../api/apiClient.js';
import { useAuth } from '../../context/AuthProvider.jsx';
import { useToast } from '../../context/ToastProvider.jsx';

export const RatingBreakdown = ({ average, count, breakdown = {} }) => (
  <div className="space-y-4">
    <div className="flex items-baseline gap-3">
      <span className="font-heading text-5xl font-semibold text-primary-950">
        {count ? average.toFixed(1) : '—'}
      </span>
      <div className="space-y-1">
        <Rating value={average} count={count} />
      </div>
    </div>
    <div className="space-y-1.5">
      {[5, 4, 3, 2, 1].map((star) => {
        const value = breakdown[star] ?? 0;
        const percent = count ? (value / count) * 100 : 0;
        return (
          <div key={star} className="flex items-center gap-3 text-xs">
            <span className="w-3 text-dark-500">{star}</span>
            <div className="h-1.5 flex-1 overflow-hidden bg-dark-200">
              <div
                className="h-full bg-primary-500"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="w-6 text-right text-dark-400">{value}</span>
          </div>
        );
      })}
    </div>
  </div>
);

export const ReviewList = ({ reviews }) => {
  if (!reviews?.length)
    return (
      <EmptyState
        icon={MessageSquare}
        title="No reviews yet"
        description="Be the first to share how this piece has worked out."
      />
    );

  return (
    <ul className="divide-y divide-dark-200">
      {reviews.map((review) => (
        <li key={review._id} className="space-y-2.5 py-6 first:pt-0">
          <div className="flex flex-wrap items-center gap-3">
            <Rating value={review.rating} size={13} showEmpty={false} count={0} />
            {review.verifiedPurchase && (
              <Badge tone="sage" className="gap-1">
                <BadgeCheck className="mr-1 h-3 w-3" />
                Verified
              </Badge>
            )}
            <span className="text-xs text-dark-400">
              {formatRelative(review.createdAt)}
            </span>
          </div>
          {review.title && (
            <h4 className="text-sm font-medium">{review.title}</h4>
          )}
          <p className="text-sm leading-relaxed text-dark-600">{review.body}</p>
          <p className="text-xs text-dark-400">{review.user?.name}</p>
        </li>
      ))}
    </ul>
  );
};

export const ReviewForm = ({ productId, onCreated }) => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isAuthenticated)
    return (
      <div className="border border-dark-200 bg-white/50 px-6 py-5 text-sm text-dark-600">
        <Button to="/login" variant="ghost" size="sm" className="px-0">
          Sign in
        </Button>{' '}
        to write a review.
      </div>
    );

  if (!open)
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Write a review
      </Button>
    );

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await productsApi.addReview(productId, {
        rating,
        title,
        body,
      });
      toast.success('Thanks — your review is published');
      setOpen(false);
      setTitle('');
      setBody('');
      onCreated?.(data.review);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-5 border border-dark-200 bg-white/50 px-6 py-6">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-dark-600">
          Your rating
        </p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              aria-label={`${star} star${star === 1 ? '' : 's'}`}
              className="p-0.5">
              <svg
                viewBox="0 0 24 24"
                className={`h-6 w-6 ${star <= rating ? 'fill-primary-500 text-primary-500' : 'fill-none text-dark-300'}`}
                stroke="currentColor"
                strokeWidth="1.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Title"
        value={title}
        maxLength={100}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Sum it up in a few words"
      />
      <Textarea
        label="Your review"
        required
        value={body}
        minLength={10}
        maxLength={1000}
        rows={4}
        onChange={(event) => setBody(event.target.value)}
        placeholder="How has it worn? Was delivery and assembly what you expected?"
      />

      <div className="flex gap-3">
        <Button type="submit" size="sm" loading={saving}>
          Publish review
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
