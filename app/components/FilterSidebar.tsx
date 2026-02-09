import {useNavigate, useSearchParams} from 'react-router';
import type {Filter, ProductFilter} from '@shopify/hydrogen/storefront-api-types';
import {FilterGroup} from './filters/FilterGroup';
import {
  getFiltersFromURL,
  filtersToSearchParams,
  toggleFilter,
  updatePriceFilter,
  getAppliedFiltersWithLabels,
  removeFilter,
  clearAllFilters,
} from '~/lib/filters';

const SORT_OPTIONS = [
  {label: 'Best selling', value: 'best-selling'},
  {label: 'Price: Low to High', value: 'price-asc'},
  {label: 'Price: High to Low', value: 'price-desc'},
  {label: 'Alphabetically: A-Z', value: 'title-asc'},
  {label: 'Alphabetically: Z-A', value: 'title-desc'},
  {label: 'Date: New to Old', value: 'created-desc'},
  {label: 'Date: Old to New', value: 'created-asc'},
];

interface FilterSidebarProps {
  filters: Filter[];
}

// Define which filters go in "More filters" section
const MORE_FILTERS_LABELS = ['More filters', 'Brand', 'Color', 'Size'];

export function FilterSidebar({filters}: FilterSidebarProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentFilters = getFiltersFromURL(searchParams);
  const appliedFilters = getAppliedFiltersWithLabels(currentFilters, filters);

  // Split filters into main and "more" sections
  const mainFilters = filters.filter(
    (f) => !MORE_FILTERS_LABELS.includes(f.label),
  );
  const moreFilters = filters.filter((f) =>
    MORE_FILTERS_LABELS.includes(f.label),
  );

  const updateURL = (newFilters: ProductFilter[]) => {
    const params = filtersToSearchParams(newFilters, searchParams);
    // Preserve other params like sort
    navigate(`?${params.toString()}`, {replace: true, preventScrollReset: true});
  };

  const handleFilterChange = (filterInput: string, checked: boolean) => {
    const newFilters = toggleFilter(currentFilters, filterInput, checked);
    updateURL(newFilters);
  };

  const handlePriceChange = (min: number, max: number) => {
    const newFilters = updatePriceFilter(currentFilters, min, max);
    updateURL(newFilters);
  };

  const handleRemoveFilter = (filter: ProductFilter) => {
    const newFilters = removeFilter(currentFilters, filter);
    updateURL(newFilters);
  };

  const handleClearAll = () => {
    updateURL(clearAllFilters());
  };

  if (!filters || filters.length === 0) {
    return null;
  }

  // Count active filters per filter group
  const getActiveCountForFilter = (filter: Filter): number => {
    return currentFilters.filter((cf) => {
      // Check if this current filter matches any value in this filter group
      return filter.values.some((v) => {
        try {
          const parsedInput = JSON.parse(v.input as string);
          return JSON.stringify(parsedInput) === JSON.stringify(cf);
        } catch {
          return false;
        }
      });
    }).length;
  };

  return (
    <aside className="filter-sidebar">
      <div className="filter-sidebar__header flex w-full justify-between">
      <span className="filter-sidebar__title block font-semibold text-[1.5rem] mb-[1.5rem] text-[rgba(var(--color-foreground),.85)]">Filter:</span>
        {appliedFilters.length > 0 && (
          <button
            type="button"
            className="filter-sidebar__remove-all underlined-link text-[rgba(var(--color-link),var(--alpha-link))] underline underline-offset-[.3rem] decoration-[.1rem] duration-[.1s] ease-in-out text-[1.3rem]"
            onClick={handleClearAll}
          >
            Remove all
          </button>
        )}
      </div>

      {/* Applied Filters Tags */}
      {appliedFilters.length > 0 && (
        <div className="filter-sidebar__applied mb-[2.5rem] flex flex-wrap gap-[1.5rem]">
          {appliedFilters.map((applied, index) => (
            <button
              key={index}
              type="button"
              className="filter-sidebar__applied-tag button button--tertiary text-[rgb(var(--color-foreground))] shadow-[0_0_0_.1rem_rgba(var(--color-foreground),.2)] rounded-[2.6rem] text-[1.3rem] min-h-0 min-w-0 py-[1rem] px-[1.2rem] gap-[0.5rem] flex items-stretch"
              onClick={() => handleRemoveFilter(applied.filter)}
            >
              {applied.label}
              <span className="filter-sidebar__applied-remove">×</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Filters */}
      <div className="filter-sidebar__groups">
        {mainFilters.map((filter) => (
          <FilterGroup
            key={filter.id}
            filter={filter}
            currentFilters={currentFilters}
            allFilters={filters}
            onFilterChange={handleFilterChange}
            onPriceChange={handlePriceChange}
            defaultExpanded={true}
            activeCount={getActiveCountForFilter(filter)}
          />
        ))}

        {/* More Filters Section */}
        {moreFilters.length > 0 && (
          <>
            {moreFilters.map((filter) => (
              <FilterGroup
                key={filter.id}
                filter={filter}
                currentFilters={currentFilters}
                allFilters={filters}
                onFilterChange={handleFilterChange}
                onPriceChange={handlePriceChange}
                defaultExpanded={false}
                activeCount={getActiveCountForFilter(filter)}
              />
            ))}
          </>
        )}
      </div>
    </aside>
  );
}

// Mobile Filter Drawer Component
interface MobileFilterDrawerProps {
  filters: Filter[];
  isOpen: boolean;
  onClose: () => void;
}

export function MobileFilterDrawer({
  filters,
  isOpen,
  onClose,
}: MobileFilterDrawerProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get current sort from URL
  const currentSort = searchParams.get('sort') || 'best-selling';

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    navigate(`?${params.toString()}`, {replace: true});
  };

  // Handle clear all filters
  const handleClearAll = () => {
    const params = filtersToSearchParams([], searchParams);
    navigate(`?${params.toString()}`, {replace: true, preventScrollReset: true});
  };

  if (!isOpen) return null;

  return (
    <div className="mobile-filter-overlay" onClick={onClose}>
      <div
        className="mobile-filter-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mobile-filter-drawer__header">
          <span className="mobile-filter-drawer__title
           font-semibold
           text-[#333]">Filter and sort</span>
          <button
            type="button"
            className="mobile-filter-drawer__close
               bg-transparent border-0
               text-4xl text-[#666]
               cursor-pointer
               p-0
               leading-none"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="mobile-filter-drawer__content">
          <FilterSidebar filters={filters} />
          {/* Sort dropdown below content */}
          <div className="mobile-sort-wrapper
            flex items-center justify-between
            gap-2
            p-3 px-4
            bg-[#F8F8F8]
            rounded
            shadow-[0_0_.5rem_rgba(var(--color-foreground),.1)]
            mb-8">
            <span className="mobile-sort-label font-semibold">Sort by:</span>
            <select
              className="mobile-sort-select"
              value={currentSort}
              onChange={handleSortChange}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mobile-filter-drawer__footer
            sticky bottom-0
            flex items-center justify-between
            gap-1
            p-8
            border-t border-[#eee]
            bg-[rgb(var(--color-background))]
            z-2">
          <button
            type="button"
            className="mobile-filter-drawer__remove-all"
            onClick={handleClearAll}
          >
            Remove all
          </button>
          <button
            type="button"
            className="mobile-filter-drawer__apply"
            onClick={onClose}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
