import { PackageSearch } from 'lucide-react';
import ProductCard, { ProductCardSkeleton } from './ProductCard.jsx';
import { EmptyState, ErrorState } from '../ui/Feedback.jsx';
import { cn } from '../../lib/cn.js';

// Vertical gutters are roughly double the horizontal ones, which is what gives a
// product grid room to breathe instead of reading as a dense table.
const GRID = 'grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4';

const ProductGrid = ({
  products,
  loading,
  error,
  onRetry,
  emptyAction,
  skeletonCount = 8,
  className,
}) => {
  if (loading)
    return (
      <div className={cn(GRID, className)}>
        {Array.from({ length: skeletonCount }, (_, index) => (
          <ProductCardSkeleton key={index} index={index} />
        ))}
      </div>
    );

  // An error only takes over the grid when there is nothing to show. Pages seed
  // their first render from the build-time snapshot, so a request that fails —
  // which, against an API that sleeps and takes ~23s to wake, is common rather
  // than exceptional — would otherwise replace a full shelf of furniture with a
  // retry button.
  if (error && !products?.length)
    return <ErrorState message={error} onRetry={onRetry} />;

  if (!products?.length)
    return (
      <EmptyState
        icon={PackageSearch}
        title="Nothing matches those filters"
        description="Try widening the price range or clearing a filter to see more pieces."
        action={emptyAction}
      />
    );

  return (
    <div className={cn(GRID, className)}>
      {products.map((product, index) => (
        <ProductCard key={product._id} product={product} index={index} />
      ))}
    </div>
  );
};

export default ProductGrid;
