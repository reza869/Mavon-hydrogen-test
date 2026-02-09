import {useState, useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router';
import type {Filter, ProductFilter} from '@shopify/hydrogen/storefront-api-types';
import {
  getFiltersFromURL,
  getAppliedFiltersWithLabels,
  removeFilter,
  clearAllFilters,
  filtersToSearchParams,
} from '~/lib/filters';

interface ProductFilterToolbarProps {
  productCount: number;
  totalCount?: number;
  onFilterClick?: () => void;
  hasFilters?: boolean;
  availableFilters?: Filter[];
}

const SORT_OPTIONS = [
  {label: 'Best selling', value: 'best-selling'},
  {label: 'Price: Low to High', value: 'price-asc'},
  {label: 'Price: High to Low', value: 'price-desc'},
  {label: 'Alphabetically: A-Z', value: 'title-asc'},
  {label: 'Alphabetically: Z-A', value: 'title-desc'},
  {label: 'Date: New to Old', value: 'created-desc'},
  {label: 'Date: Old to New', value: 'created-asc'},
];

export function ProductFilterToolbar({
  productCount,
  totalCount,
  onFilterClick,
  hasFilters = false,
  availableFilters = [],
}: ProductFilterToolbarProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [gridColumns, setGridColumns] = useState<number>(4);

  // Get current filters and applied filter labels for mobile display
  const currentFilters = getFiltersFromURL(searchParams);
  const appliedFilters = getAppliedFiltersWithLabels(currentFilters, availableFilters);

  const updateURL = (newFilters: ProductFilter[]) => {
    const params = filtersToSearchParams(newFilters, searchParams);
    navigate(`?${params.toString()}`, {replace: true, preventScrollReset: true});
  };

  const handleRemoveFilter = (filter: ProductFilter) => {
    const newFilters = removeFilter(currentFilters, filter);
    updateURL(newFilters);
  };

  const handleClearAll = () => {
    updateURL(clearAllFilters());
  };

  // Get current sort from URL
  const currentSort = searchParams.get('sort') || 'best-selling';

  // Load grid preference from localStorage on mount
  useEffect(() => {
    const savedGrid = localStorage.getItem('productGridColumns');
    if (savedGrid) {
      setGridColumns(parseInt(savedGrid, 10));
    }
  }, []);

  // Update grid columns and save to localStorage
  const handleGridChange = (columns: number) => {
    setGridColumns(columns);
    localStorage.setItem('productGridColumns', columns.toString());

    // Update CSS class on the products grid
    const grid = document.querySelector('.products-grid');
    if (grid) {
      grid.classList.remove('grid-cols-2', 'grid-cols-3', 'grid-cols-4');
      grid.classList.add(`grid-cols-${columns}`);
    }
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    navigate(`?${params.toString()}`, {replace: true});
  };

  // Apply grid class on mount and when gridColumns changes
  useEffect(() => {
    const grid = document.querySelector('.products-grid');
    if (grid) {
      grid.classList.remove('grid-cols-2', 'grid-cols-3', 'grid-cols-4');
      grid.classList.add(`grid-cols-${gridColumns}`);
    }
  }, [gridColumns]);

  // Display count - show "X of Y" if totalCount provided, otherwise just count
  const displayCount = totalCount && totalCount !== productCount
    ? `${productCount} of ${totalCount} products`
    : `${productCount} products`;

  return (
    <>
      <div className="product__filter--toolbar
            flex items-center justify-between
            mb-3.5 md:mb-[30px]
            rounded
            py-2.5 px-0
            md:py-4 md:px-12 md:bg-[#F8F8F8]">

        {/* Mobile Filter Button */}
        {hasFilters && onFilterClick && (
          <button
            type="button"
            className="filter-button-mobile
            flex items-center text-left
            text-[rgba(var(--color-link),var(--alpha-link))]
            bg-[rgba(var(--color-foreground),.06)]
            p-4
            rounded md:hidden"
            onClick={onFilterClick}
          >
            <FilterIcon />
            <span className="text-2xl tracking-[.1rem] leading-5 ml-4">Filter and sort</span>
          </button>
        )}
        {/* Grid Switcher */}
        <div className="grid-switcher">
          <button
            type="button"
            className={`grid-switcher__btn ${gridColumns === 2 ? 'active' : ''}`}
            onClick={() => handleGridChange(2)}
            aria-label="2 columns"
          >
            <GridIcon2 />
          </button>
          <button
            type="button"
            className={`grid-switcher__btn ${gridColumns === 3 ? 'active' : ''}`}
            onClick={() => handleGridChange(3)}
            aria-label="3 columns"
          >
            <GridIcon3 />
          </button>
          <button
            type="button"
            className={`grid-switcher__btn ${gridColumns === 4 ? 'active' : ''}`}
            onClick={() => handleGridChange(4)}
            aria-label="4 columns"
          >
            <GridIcon4 />
          </button>
        </div>

        {/* Right Side - Sort & Count */}
        <div className="toolbar-right">
          <div className="sort-wrapper flex items-center flex-grow justify-en">
            <span className="sort-label block text-[1.4rem] mr-[1rem] font-bold text-[rgba(var(--color-foreground))]">Sort by:</span>
            <select
              className="sort-select appearance-none bg-transparent rounded-[4px] py-[0.5rem] pr-[2rem] pl-[0.75rem] text-[1.5rem] text-[#333] cursor-pointer min-w-[150px]"
              value={currentSort}
              onChange={handleSortChange}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="sort-arrow"><svg xmlns="http://www.w3.org/2000/svg" className="icon icon-caret" viewBox="0 0 512 512" fill="currentColor">
  <title>Caret Down</title><path d="M98 190.06l139.78 163.12a24 24 0 0036.44 0L414 190.06c13.34-15.57 2.28-39.62-18.22-39.62h-279.6c-20.5 0-31.56 24.05-18.18 39.62z"></path>
</svg></span>
          </div>
          <span className="product-count whitespace-nowrap text-xl font-bold m-0 text-[rgb(var(--color-foreground))]">{displayCount}</span>
        </div>
      </div>

      {/* Mobile Applied Filters - shown below toolbar */}
      {appliedFilters.length > 0 && (
        <div className="mobile-applied-filters mb-3.5 md:mb-[30px]">
          {appliedFilters.map((applied, index) => (
            <button
              key={index}
              type="button"
              className="mobile-applied-filter-tag
               inline-flex items-center gap-1
               px-4 py-3
               border border-[#ddd]
               rounded-[25px]
               text-[#333]
               bg-white
               cursor-pointer
               transition-all duration-200 ease-in-out"
              onClick={() => handleRemoveFilter(applied.filter)}
            >
              {applied.label}
              <span className="mobile-applied-filter-remove
             text-2xl
             leading-none
             text-[#666]
             ml-1">×</span>
            </button>
          ))}
          <button
            type="button"
            className="mobile-remove-all
               bg-transparent border-0
               text-[#666]
               cursor-pointer underline
               py-1
               ml-auto"
            onClick={handleClearAll}
          >
            Remove all
          </button>
        </div>
      )}
    </>
  );
}

// Grid Icons
function GridIcon2() {
  return (
    <svg width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5.5 12.5">
      <path d="M.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 01.75 0z" fillRule="evenodd" />
      <path d="M4.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 014.75 0z" fillRule="evenodd" />
    </svg>
  );
}

function GridIcon3() {
  return (
    <svg width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9.5 12.5">
      <path d="M.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 01.75 0z" fillRule="evenodd" />
      <path d="M4.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 014.75 0z" fillRule="evenodd" />
      <path d="M8.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 018.75 0z" fillRule="evenodd" />
    </svg>
  );
}

function GridIcon4() {
  return (
    <svg width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13.5 12.5">
      <path d="M.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 01.75 0z" fillRule="evenodd" />
      <path d="M4.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 014.75 0z" fillRule="evenodd" />
      <path d="M8.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 018.75 0z" fillRule="evenodd" />
      <path d="M12.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11a.76.76 0 01.75-.75z" fillRule="evenodd" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" role="presentation" className="icon icon-filter w-8" fill="none" viewBox="0 11 20 20">
      <line x1="16.5" y1="17.5" x2="3.5" y2="17.5" stroke="#3F7972" strokeLinecap="round"></line>
      <line x1="16.5" y1="24.5" x2="3.5" y2="24.5" stroke="#3F7972" strokeLinecap="round"></line>
      <circle cx="13" cy="24.5" r="2" fill="white" stroke="#3F7972"></circle>
      <circle cx="7" cy="17.5" r="2" fill="white" stroke="#3F7972"></circle>
    </svg>
  );
}

// Helper function to get sort key and reverse for GraphQL
// Works for both ProductSortKeys (all products) and ProductCollectionSortKeys (collection products)
export function getSortValuesFromParam(sortParam: string | null): {
  sortKey: string;
  reverse: boolean;
} {
  switch (sortParam) {
    case 'price-asc':
      return {sortKey: 'PRICE', reverse: false};
    case 'price-desc':
      return {sortKey: 'PRICE', reverse: true};
    case 'title-asc':
      return {sortKey: 'TITLE', reverse: false};
    case 'title-desc':
      return {sortKey: 'TITLE', reverse: true};
    case 'created-desc':
      return {sortKey: 'CREATED', reverse: true};
    case 'created-asc':
      return {sortKey: 'CREATED', reverse: false};
    case 'best-selling':
    default:
      return {sortKey: 'BEST_SELLING', reverse: false};
  }
}
