import { X } from 'lucide-react';
import { Checkbox, Input } from '../ui/Field.jsx';
import { SUBCATEGORY_LABELS } from '../../constants/catalog.js';
import { formatPrice } from '../../lib/format.js';
import { cn } from '../../lib/cn.js';

const FilterPanel = ({ filters, update, clear, activeCount, facets, category }) => {
  // Only offer subcategories that exist in the current room, so the rail never
  // shows a filter that would return nothing.
  const available = (facets?.categories ?? [])
    .filter((facet) => !category || facet.category === category)
    .reduce((acc, facet) => {
      acc[facet.subcategory] = (acc[facet.subcategory] ?? 0) + facet.count;
      return acc;
    }, {});

  const subcategories = Object.entries(available).sort((a, b) => b[1] - a[1]);
  const range = facets?.priceRange;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Filter</p>
        {activeCount > 0 && (
          <button
            onClick={clear}
            className="inline-flex items-center gap-1 text-xs text-dark-500 underline transition-colors hover:text-primary-800">
            <X className="h-3 w-3" />
            Clear {activeCount}
          </button>
        )}
      </div>

      {subcategories.length > 0 && (
        <fieldset className="space-y-3">
          <legend className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-dark-600">
            Type
          </legend>
          <button
            onClick={() => update({ subcategory: '' })}
            className={cn(
              'flex w-full items-center justify-between text-sm transition-colors',
              !filters.subcategory
                ? 'text-primary-900'
                : 'text-dark-500 hover:text-primary-800'
            )}>
            <span>All types</span>
          </button>
          {subcategories.map(([slug, count]) => (
            <button
              key={slug}
              onClick={() =>
                update({ subcategory: filters.subcategory === slug ? '' : slug })
              }
              className={cn(
                'flex w-full items-center justify-between text-sm transition-colors',
                filters.subcategory === slug
                  ? 'text-primary-900'
                  : 'text-dark-500 hover:text-primary-800'
              )}>
              <span>{SUBCATEGORY_LABELS[slug] ?? slug}</span>
              <span className="text-xs text-dark-400">{count}</span>
            </button>
          ))}
        </fieldset>
      )}

      <fieldset className="space-y-3">
        <legend className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-dark-600">
          Price
        </legend>
        {range && (
          <p className="text-xs text-dark-400">
            {formatPrice(range.min)} – {formatPrice(range.max)}
          </p>
        )}
        <div className="flex items-center gap-3">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            aria-label="Minimum price"
            value={filters.minPrice}
            min={0}
            onChange={(event) => update({ minPrice: event.target.value })}
          />
          <span className="mt-1 text-dark-300">–</span>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            aria-label="Maximum price"
            value={filters.maxPrice}
            min={0}
            onChange={(event) => update({ maxPrice: event.target.value })}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-dark-600">
          Availability
        </legend>
        <Checkbox
          label="In stock only"
          checked={filters.inStock}
          onChange={(event) => update({ inStock: event.target.checked })}
        />
        <Checkbox
          label="On sale"
          checked={filters.onSale}
          onChange={(event) => update({ onSale: event.target.checked })}
        />
      </fieldset>
    </div>
  );
};

export default FilterPanel;
