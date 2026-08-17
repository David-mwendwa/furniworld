import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Truck, ShieldCheck, Wrench, PackageX } from 'lucide-react';
import { Container, Badge, Price, Rating, SectionHeading, Skeleton, EmptyState } from '../components/ui/Feedback.jsx';
import Button from '../components/ui/Button.jsx';
import { Breadcrumbs, QuantityStepper } from '../components/ui/Controls.jsx';
import ImageGallery from '../components/product/ImageGallery.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import {
  ReviewList,
  ReviewForm,
  RatingBreakdown,
} from '../components/reviews/Reviews.jsx';
import { productsApi } from '../api/index.js';
import { useFetch } from '../hooks/useFetch.js';
import { useCart } from '../context/CartProvider.jsx';
import {
  CATEGORY_LABELS,
  SUBCATEGORY_LABELS,
  FREE_DELIVERY_THRESHOLD,
} from '../constants/catalog.js';
import { formatPrice } from '../lib/format.js';

const ProductDetail = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const buyBoxRef = useRef(null);

  const { data, loading, error, setData, refetch: refetchProduct } = useFetch(
    useCallback(() => productsApi.bySlug(slug), [slug]),
    [slug]
  );

  const reviewsQuery = useFetch(
    useCallback(() => productsApi.reviews(slug), [slug]),
    [slug]
  );

  useEffect(() => setQuantity(1), [slug]);

  // The sticky purchase bar only appears once the real buy box has scrolled away.
  useEffect(() => {
    const target = buyBoxRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { rootMargin: '-80px 0px 0px 0px' }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [data]);

  if (loading)
    return (
      <Container className="py-10">
        <div className="grid gap-12 lg:grid-cols-2">
          <Skeleton className="aspect-[4/3] w-full" />
          <div className="space-y-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-48" />
          </div>
        </div>
      </Container>
    );

  if (error || !data?.product)
    return (
      <Container className="py-20">
        <EmptyState
          icon={PackageX}
          title="That piece is no longer listed"
          description={error ?? 'It may have been archived or the link is wrong.'}
          action={<Button to="/shop">Browse the collection</Button>}
        />
      </Container>
    );

  const { product, related } = data;
  const soldOut = product.stock === 0;
  const attributes = product.attributes ?? {};
  const dims = attributes.dimensions;

  const specs = [
    ['Material', attributes.material],
    ['Colour', attributes.colour],
    [
      'Dimensions',
      dims?.width
        ? `${dims.width} × ${dims.depth} × ${dims.height} ${dims.unit ?? 'cm'} (W×D×H)`
        : null,
    ],
    ['Seats', attributes.seats],
    ['Weight', attributes.weightKg ? `${attributes.weightKg} kg` : null],
    [
      'Warranty',
      attributes.warrantyMonths ? `${attributes.warrantyMonths} months` : null,
    ],
    [
      'Assembly',
      attributes.assemblyRequired == null
        ? null
        : attributes.assemblyRequired
          ? 'Required — included free'
          : 'Arrives assembled',
    ],
    ['SKU', product.sku],
  ].filter(([, value]) => value != null && value !== '');

  return (
    <>
      <Container className="py-10 lg:py-14">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Shop', to: '/shop' },
            {
              label: CATEGORY_LABELS[product.category],
              to: `/shop/${product.category}`,
            },
            { label: product.name },
          ]}
        />

        <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <ImageGallery images={product.images} name={product.name} />

          <div ref={buyBoxRef} className="space-y-7">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="eyebrow">
                  {SUBCATEGORY_LABELS[product.subcategory]}
                </p>
                {product.discountPercent > 0 && (
                  <Badge tone="sale">−{product.discountPercent}%</Badge>
                )}
              </div>
              <h1 className="text-display-sm lg:text-4xl">{product.name}</h1>
              <Rating
                value={product.ratingsAverage}
                count={product.ratingsCount}
              />
            </div>

            <Price
              value={product.price}
              compareAt={product.compareAtPrice}
              size="xl"
            />

            {product.shortDescription && (
              <p className="text-base leading-relaxed text-dark-600">
                {product.shortDescription}
              </p>
            )}

            <div className="space-y-4 border-y border-dark-200 py-6">
              {soldOut ? (
                <p className="text-sm text-danger-600">
                  Out of stock. Contact the showroom for the next delivery date.
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-4">
                    <QuantityStepper
                      value={quantity}
                      max={Math.min(product.stock, 20)}
                      onChange={setQuantity}
                    />
                    <Button
                      size="lg"
                      className="flex-1 min-w-[200px]"
                      onClick={() => addItem(product, quantity)}>
                      Add to cart
                    </Button>
                  </div>
                  {product.isLowStock && (
                    <p className="text-xs text-warning-700">
                      Only {product.stock} left in stock
                    </p>
                  )}
                </>
              )}
            </div>

            <ul className="space-y-3 text-sm text-dark-600">
              <li className="flex items-start gap-3">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                <span>
                  Free delivery on orders over{' '}
                  {formatPrice(FREE_DELIVERY_THRESHOLD)}. Same day in Nairobi.
                </span>
              </li>
              {attributes.warrantyMonths && (
                <li className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                  <span>{attributes.warrantyMonths}-month warranty included.</span>
                </li>
              )}
              {attributes.assemblyRequired && (
                <li className="flex items-start gap-3">
                  <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                  <span>Assembled in your room at no extra charge.</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-20 grid gap-14 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <h2 className="text-2xl">About this piece</h2>
            <p className="whitespace-pre-line text-base leading-relaxed text-dark-600">
              {product.description}
            </p>
          </div>

          {specs.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl">Specification</h2>
              <dl className="divide-y divide-dark-200 border-y border-dark-200">
                {specs.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-6 py-3">
                    <dt className="text-xs uppercase tracking-[0.12em] text-dark-500">
                      {label}
                    </dt>
                    <dd className="text-right text-sm text-dark-700">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        <div className="mt-20 grid gap-12 lg:grid-cols-[280px_1fr] lg:gap-16">
          <div className="space-y-8">
            <h2 className="text-2xl">Reviews</h2>
            <RatingBreakdown
              average={product.ratingsAverage}
              count={product.ratingsCount}
              breakdown={reviewsQuery.data?.breakdown}
            />
            <ReviewForm
              productId={product._id}
              onCreated={() => {
                reviewsQuery.refetch();
                refetchProduct();
              }}
            />
          </div>
          <ReviewList
            reviews={reviewsQuery.data?.reviews}
            onChange={() => {
              reviewsQuery.refetch();
              refetchProduct();
            }}
          />
        </div>

        {related?.length > 0 && (
          <div className="mt-24">
            <SectionHeading eyebrow="You may also like" title="Similar pieces" />
            <ProductGrid className="mt-10" products={related} skeletonCount={4} />
          </div>
        )}
      </Container>

      {showStickyBar && !soldOut && (
        <div className="fixed inset-x-0 bottom-0 z-40 animate-fade-up border-t border-dark-200 bg-cream/95 backdrop-blur-md">
          <Container className="flex items-center justify-between gap-6 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{product.name}</p>
              <Price
                value={product.price}
                compareAt={product.compareAtPrice}
                size="sm"
              />
            </div>
            <Button onClick={() => addItem(product, quantity)}>Add to cart</Button>
          </Container>
        </div>
      )}
    </>
  );
};

export default ProductDetail;
