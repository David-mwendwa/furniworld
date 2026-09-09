import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import { Container } from '../components/ui/Feedback.jsx';
import Button from '../components/ui/Button.jsx';
import { Breadcrumbs, Pagination } from '../components/ui/Controls.jsx';
import { Sheet } from '../components/ui/Overlay.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import FilterPanel from '../components/product/FilterPanel.jsx';
import { productsApi } from '../api/index.js';
import { useFetch } from '../hooks/useFetch.js';
import { useShopFilters } from '../hooks/useShopFilters.js';
import snapshot from '../data/snapshot.json';
import { useSeo } from '../hooks/useSeo.js';
import {
  breadcrumbJsonLd,
  canonicalUrl,
  itemListJsonLd,
  metaForPath,
} from '../lib/seo.js';
import { useDebounce } from '../hooks/useDebounce.js';
import {
  CATEGORY_LABELS,
  SORT_OPTIONS,
  SUBCATEGORY_LABELS,
} from '../constants/catalog.js';

const Shop = () => {
  const { category } = useParams();
  const { filters, update, clear, activeCount, queryParams } = useShopFilters();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput);

  // Keeps the input responsive while the request only fires once typing settles.
  useEffect(() => {
    if (debouncedSearch !== filters.search) update({ search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => setSearchInput(filters.search), [filters.search]);

  const params = category ? { ...queryParams, category } : queryParams;
  const key = JSON.stringify(params);

  /*
   * The unfiltered first page comes from the build-time snapshot; every other
   * view waits for the API.
   *
   * `/shop` with no query string is what the nav, the home page and any search
   * result link to, and it is the view the snapshot holds (see LISTING in
   * scripts/build-snapshot.mjs). A filtered or paged view deliberately gets
   * nothing: the snapshot contains one page of one query, and showing page 1
   * of everything to someone who asked for page 3 of dining under Ksh 40,000
   * would be wrong rather than merely early.
   */
  const isDefaultView =
    params.sort === snapshot.listing.params.sort &&
    params.limit === snapshot.listing.params.limit &&
    Number(params.page) === 1 &&
    // `queryParams` only carries sort/page/limit until a filter is set, so the
    // key count is what proves nothing else is applied — plus `category` when
    // the route supplies one, which is a listing the snapshot also holds.
    // Comparing the serialised object instead would depend on key order and on
    // `page` being a number here and a string in the URL, and would quietly
    // never match.
    Object.keys(params).length === (category ? 4 : 3);

  // The category listings are snapshotted too, so /shop/dining-room opens with
  // furniture in it rather than skeletons while the API wakes.
  const seed = !isDefaultView
    ? null
    : category
      ? (snapshot.categories?.[category] ?? null)
      : snapshot.listing;

  const { data, loading, error, refetch } = useFetch(
    useCallback(() => productsApi.list(params), [key]),
    [key],
    { initialData: seed }
  );
  const facets = useFetch(useCallback(() => productsApi.facets(), []), [], {
    initialData: snapshot.home.facets,
  });

  const title = category ? CATEGORY_LABELS[category] : 'All furniture';
  const meta = data?.meta;

  /*
   * What a listing URL claims to be, given its filters.
   *
   * A faceted listing generates effectively unlimited URLs — four categories
   * times a subcategory times a price range times a sort order. Left alone a
   * crawler treats each as its own page, spends the crawl budget on them, and
   * has to guess which near-identical one to rank. So: a search is `noindex`
   * (it is a query someone typed, not a page the shop offers), a filtered
   * listing consolidates onto the category it filters, and pagination stays
   * self-referential — pointing page 2 at page 1 tells a crawler page 2 is a
   * duplicate and the pieces only reachable from it stop being found.
   */
  const basePath = category ? `/shop/${category}` : '/shop';
  // Search is handled separately (it is `noindex` rather than consolidated),
  // so it is deliberately not one of these.
  const hasFilters = Boolean(
    filters.subcategory ||
      filters.inStock ||
      filters.onSale ||
      filters.minPrice ||
      filters.maxPrice
  );
  const canonicalPath =
    hasFilters || Number(filters.page) === 1
      ? basePath
      : `${basePath}?page=${filters.page}`;

  const routeMeta = metaForPath(basePath);
  const products = data?.products ?? [];

  useSeo({
    ...routeMeta,
    title: Number(filters.page) > 1 ? `${title} — page ${filters.page}` : routeMeta.title,
    canonical: filters.search ? null : canonicalUrl(canonicalPath),
    noindex: Boolean(filters.search),
    jsonLd: products.length
      ? [
          itemListJsonLd(products, canonicalPath),
          breadcrumbJsonLd(
            [
              { name: 'Home', path: '/' },
              { name: 'Shop', path: '/shop' },
              category && { name: CATEGORY_LABELS[category], path: `/shop/${category}` },
            ].filter(Boolean),
          ),
        ]
      : null,
  });

  const panel = (
    <FilterPanel
      filters={filters}
      update={update}
      clear={clear}
      activeCount={activeCount}
      facets={facets.data}
      category={category}
    />
  );

  return (
    <Container className="py-10 lg:py-14">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Shop', to: '/shop' },
          ...(category ? [{ label: title }] : []),
        ]}
      />

      <div className="mt-6 space-y-3">
        <h1 className="text-display-sm lg:text-5xl">{title}</h1>
        <p className="text-sm text-dark-500">
          {meta ? `${meta.total} piece${meta.total === 1 ? '' : 's'}` : ' '}
          {filters.search && meta ? ` matching “${filters.search}”` : ''}
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-14">
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--header-h)+2rem)]">{panel}</div>
        </aside>

        <div>
          <div className="flex flex-wrap items-center gap-3 border-b border-dark-200 pb-5">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search this collection"
                aria-label="Search products"
                className="h-11 w-full border-dark-300 bg-white/70 pl-10 pr-9 text-sm focus:border-primary-600 focus:ring-0"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setSheetOpen(true)}
              className="inline-flex h-11 items-center gap-2 border border-dark-300 px-4 text-xs font-medium uppercase tracking-[0.12em] lg:hidden">
              <SlidersHorizontal className="h-4 w-4" />
              Filter
              {activeCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-800 text-[0.6rem] text-cream">
                  {activeCount}
                </span>
              )}
            </button>

            <select
              value={filters.sort}
              onChange={(event) => update({ sort: event.target.value })}
              aria-label="Sort products"
              className="h-11 border-dark-300 bg-white/70 text-sm focus:border-primary-600 focus:ring-0">
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {activeCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-5">
              {filters.subcategory && (
                <ActiveFilter
                  label={SUBCATEGORY_LABELS[filters.subcategory]}
                  onClear={() => update({ subcategory: '' })}
                />
              )}
              {filters.inStock && (
                <ActiveFilter
                  label="In stock"
                  onClear={() => update({ inStock: false })}
                />
              )}
              {filters.onSale && (
                <ActiveFilter
                  label="On sale"
                  onClear={() => update({ onSale: false })}
                />
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <ActiveFilter
                  label={`${filters.minPrice || '0'} – ${filters.maxPrice || 'any'}`}
                  onClear={() => update({ minPrice: '', maxPrice: '' })}
                />
              )}
            </div>
          )}

          <ProductGrid
            className="mt-8"
            products={data?.products}
            loading={loading}
            error={error}
            onRetry={refetch}
            skeletonCount={12}
            emptyAction={
              activeCount > 0 && (
                <Button variant="outline" size="sm" onClick={clear}>
                  Clear filters
                </Button>
              )
            }
          />

          {meta && (
            <Pagination
              className="mt-16"
              page={meta.page}
              pages={meta.pages}
              onChange={(page) => update({ page }, { resetPage: false })}
            />
          )}
        </div>
      </div>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Filter">
        {panel}
        <Button className="mt-8 w-full" onClick={() => setSheetOpen(false)}>
          Show results
        </Button>
      </Sheet>
    </Container>
  );
};

const ActiveFilter = ({ label, onClear }) => (
  <button
    onClick={onClear}
    className="inline-flex items-center gap-1.5 border border-dark-300 px-3 py-1.5 text-xs text-dark-600 transition-colors hover:border-danger-300 hover:text-danger-600">
    {label}
    <X className="h-3 w-3" />
  </button>
);

export default Shop;
