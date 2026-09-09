import { useCallback } from 'react';
import { Container, SectionHeading } from '../components/ui/Feedback.jsx';
import Button from '../components/ui/Button.jsx';
import Hero from '../components/home/Hero.jsx';
import {
  ValueProps,
  CategoryTiles,
  EditorialSplit,
  Newsletter,
} from '../components/home/HomeSections.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import { productsApi } from '../api/index.js';
import { useFetch } from '../hooks/useFetch.js';
import snapshot from '../data/snapshot.json';
import { useSeo } from '../hooks/useSeo.js';
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  canonicalUrl,
  organizationJsonLd,
  websiteJsonLd,
} from '../lib/seo.js';

const Home = () => {
  // Both graphs live on the home page and nowhere else: they describe the shop
  // as a whole, and repeating them per route would have every product page
  // re-declaring the business that owns it.
  useSeo({
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    canonical: canonicalUrl('/'),
    jsonLd: [organizationJsonLd(), websiteJsonLd()],
  });

  const featured = useFetch(useCallback(() => productsApi.featured(), []), [], {
    initialData: snapshot.home.featured,
  });
  const facets = useFetch(useCallback(() => productsApi.facets(), []), [], {
    initialData: snapshot.home.facets,
  });
  const newest = useFetch(
    useCallback(() => productsApi.list({ limit: 8, sort: 'newest' }), []),
    [],
    { initialData: snapshot.home.newest }
  );
  const onSale = useFetch(
    useCallback(
      () => productsApi.list({ limit: 4, onSale: 'true', sort: 'price-desc' }),
      []
    ),
    [],
    { initialData: snapshot.home.onSale }
  );

  const featuredProducts = featured.data?.products ?? [];

  return (
    <>
      <Hero product={featuredProducts[0]} />
      <ValueProps />

      <Container className="py-20">
        <SectionHeading
          eyebrow="Featured"
          title="Chosen for this month"
          description="The pieces our showroom staff point people towards first."
          action={
            <Button to="/shop" variant="outline" size="sm">
              Shop all
            </Button>
          }
        />
        <ProductGrid
          className="mt-12"
          products={featuredProducts}
          loading={featured.loading}
          error={featured.error}
          onRetry={featured.refetch}
          skeletonCount={4}
        />
      </Container>

      <CategoryTiles facets={facets.data} />
      <EditorialSplit product={featuredProducts[1] ?? featuredProducts[0]} />

      <Container className="py-20">
        <SectionHeading
          eyebrow="On sale"
          title="Festive prices, still running"
          action={
            <Button to="/shop?onSale=true" variant="outline" size="sm">
              All reduced pieces
            </Button>
          }
        />
        <ProductGrid
          className="mt-12"
          products={onSale.data?.products}
          loading={onSale.loading}
          error={onSale.error}
          onRetry={onSale.refetch}
          skeletonCount={4}
        />
      </Container>

      <Container className="pb-20">
        <SectionHeading eyebrow="Latest" title="New in the showroom" />
        <ProductGrid
          className="mt-12"
          products={newest.data?.products}
          loading={newest.loading}
          error={newest.error}
          onRetry={newest.refetch}
        />
      </Container>

      <Newsletter />
    </>
  );
};

export default Home;
