import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const DEFAULTS = { sort: 'newest', page: '1' };

/**
 * Shop state lives in the URL so a filtered result set is shareable and the
 * browser back button steps through filter changes as a user expects.
 */
export const useShopFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => ({
      search: searchParams.get('search') ?? '',
      subcategory: searchParams.get('subcategory') ?? '',
      minPrice: searchParams.get('minPrice') ?? '',
      maxPrice: searchParams.get('maxPrice') ?? '',
      inStock: searchParams.get('inStock') === 'true',
      onSale: searchParams.get('onSale') === 'true',
      sort: searchParams.get('sort') ?? DEFAULTS.sort,
      page: Number(searchParams.get('page') ?? DEFAULTS.page),
    }),
    [searchParams]
  );

  const update = useCallback(
    (patch, { resetPage = true } = {}) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);

          for (const [key, value] of Object.entries(patch)) {
            if (value === '' || value == null || value === false)
              next.delete(key);
            else next.set(key, String(value));
          }

          if (resetPage && !('page' in patch)) next.delete('page');
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const clear = useCallback(
    () => setSearchParams(new URLSearchParams(), { replace: true }),
    [setSearchParams]
  );

  const activeCount = useMemo(
    () =>
      [
        filters.subcategory,
        filters.minPrice,
        filters.maxPrice,
        filters.inStock,
        filters.onSale,
        filters.search,
      ].filter(Boolean).length,
    [filters]
  );

  /** Shape the product list endpoint expects, with price folded into operators. */
  const queryParams = useMemo(() => {
    const params = {
      sort: filters.sort,
      page: filters.page,
      limit: 12,
    };

    if (filters.search) params.search = filters.search;
    if (filters.subcategory) params.subcategory = filters.subcategory;
    if (filters.inStock) params.inStock = 'true';
    if (filters.onSale) params.onSale = 'true';

    if (filters.minPrice) params['price[gte]'] = filters.minPrice;
    if (filters.maxPrice) params['price[lte]'] = filters.maxPrice;

    return params;
  }, [filters]);

  return { filters, update, clear, activeCount, queryParams };
};
