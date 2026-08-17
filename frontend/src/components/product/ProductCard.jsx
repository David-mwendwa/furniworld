import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Badge, Price, Rating } from '../ui/Feedback.jsx';
import { productImage, productImageAlt } from '../../lib/images.js';
import { SUBCATEGORY_LABELS } from '../../constants/catalog.js';
import { useCart } from '../../context/CartProvider.jsx';
import { cn } from '../../lib/cn.js';

const ProductCard = ({ product, index = 0, className }) => {
  const { addItem } = useCart();
  const hasSecondImage = product.images?.length > 1;
  const soldOut = product.stock === 0;

  return (
    <article
      className={cn('group animate-fade-up', className)}
      style={{ animationDelay: `${Math.min(index, 11) * 45}ms` }}>
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative aspect-product overflow-hidden bg-primary-50">
          <img
            src={productImage(product)}
            alt={productImageAlt(product)}
            loading={index < 4 ? 'eager' : 'lazy'}
            className={cn(
              'h-full w-full object-cover transition-all duration-700 ease-premium',
              hasSecondImage
                ? 'group-hover:opacity-0'
                : 'group-hover:scale-[1.04]'
            )}
          />
          {hasSecondImage && (
            <img
              src={productImage(product, 1)}
              alt=""
              aria-hidden
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 ease-premium group-hover:opacity-100"
            />
          )}

          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {soldOut ? (
              <Badge tone="neutral">Sold out</Badge>
            ) : (
              <>
                {product.discountPercent > 0 && (
                  <Badge tone="sale">−{product.discountPercent}%</Badge>
                )}
                {product.featured && <Badge tone="primary">Featured</Badge>}
              </>
            )}
          </div>

          {!soldOut && (
            <button
              onClick={(event) => {
                event.preventDefault();
                addItem(product);
              }}
              className="absolute inset-x-3 bottom-3 flex h-11 translate-y-2 items-center justify-center gap-2 bg-primary-900/95 text-xs font-medium uppercase tracking-[0.14em] text-cream opacity-0 transition-all duration-300 ease-premium group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100">
              <ShoppingBag className="h-3.5 w-3.5" />
              Add to cart
            </button>
          )}
        </div>
      </Link>

      <div className="mt-4 space-y-1.5">
        <p className="text-[0.68rem] uppercase tracking-[0.14em] text-dark-400">
          {SUBCATEGORY_LABELS[product.subcategory]}
        </p>
        <h3 className="text-base font-normal leading-snug">
          <Link
            to={`/product/${product.slug}`}
            className="transition-colors hover:text-primary-700">
            {product.name}
          </Link>
        </h3>
        <Price value={product.price} compareAt={product.compareAtPrice} />
        {product.ratingsCount > 0 && (
          <Rating
            value={product.ratingsAverage}
            count={product.ratingsCount}
            size={12}
          />
        )}
      </div>
    </article>
  );
};

export const ProductCardSkeleton = ({ index = 0 }) => (
  <div
    className="animate-fade-up space-y-4"
    style={{ animationDelay: `${Math.min(index, 11) * 45}ms` }}>
    <div className="skeleton aspect-product w-full" />
    <div className="space-y-2">
      <div className="skeleton h-2.5 w-20" />
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-4 w-24" />
    </div>
  </div>
);

export default ProductCard;
