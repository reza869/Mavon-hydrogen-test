import {useState} from 'react';
import type {Filter, ProductFilter} from '@shopify/hydrogen/storefront-api-types';
import {FilterCheckbox} from './FilterCheckbox';
import {PriceRangeFilter} from './PriceRangeFilter';
import {isFilterApplied, getPriceRangeFromFilters, getMaxPriceFromFilterValues} from '~/lib/filters';

interface FilterGroupProps {
  filter: Filter;
  currentFilters: ProductFilter[];
  allFilters: Filter[];
  onFilterChange: (filterInput: string, checked: boolean) => void;
  onPriceChange: (min: number, max: number) => void;
  defaultExpanded?: boolean;
  activeCount?: number;
}

const INITIAL_VISIBLE_COUNT = 10;

export function FilterGroup({
  filter,
  currentFilters,
  allFilters,
  onFilterChange,
  onPriceChange,
  defaultExpanded = true,
  activeCount = 0,
}: FilterGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showAll, setShowAll] = useState(false);

  const visibleValues = showAll
    ? filter.values
    : filter.values.slice(0, INITIAL_VISIBLE_COUNT);

  const hasMoreValues = filter.values.length > INITIAL_VISIBLE_COUNT;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Render price range filter
  if (filter.type === 'PRICE_RANGE') {
    const maxPrice = getMaxPriceFromFilterValues(allFilters);
    const currentPriceRange = getPriceRangeFromFilters(currentFilters);

    // Check if price filter is active
    const hasPriceFilter = currentFilters.some((f) => 'price' in f);

    return (
      <div className="filter-group shadow-[0_0_.5rem_rgba(var(--color-foreground),.1)] rounded-[.5rem] mb-[2rem]">
        <button
          type="button"
          className="filter-group__header
         flex justify-between items-center w-full
         py-3 px-4
         bg-[#F8F8F8]
         border-0 border-b border-transparent
         cursor-pointer
         text-left"
          onClick={toggleExpanded}
          aria-expanded={isExpanded}
        >
          <span className="filter-group__label text-[1.6rem] font-semibold text-[rgba(var(--color-foreground))]">
            {filter.label}
            {hasPriceFilter && <span className="filter-group__count"> (1)</span>}
          </span>
          <span className={`filter-group__arrow ${isExpanded ? 'filter-group__arrow--expanded' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-caret" viewBox="0 0 512 512" fill="currentColor">
              <title>Caret Down</title>
              <path d="M98 190.06l139.78 163.12a24 24 0 0036.44 0L414 190.06c13.34-15.57 2.28-39.62-18.22-39.62h-279.6c-20.5 0-31.56 24.05-18.18 39.62z"></path>
            </svg>
          </span>
        </button>
        {isExpanded && (
          <div className="filter-group__content p-[1.5rem] m-0">
            <PriceRangeFilter
              maxPrice={maxPrice}
              currentMin={currentPriceRange?.min ?? 0}
              currentMax={currentPriceRange?.max ?? maxPrice}
              onChange={onPriceChange}
            />
          </div>
        )}
      </div>
    );
  }

  // Render list filter (checkboxes)
  return (
    <div className="filter-group shadow-[0_0_.5rem_rgba(var(--color-foreground),.1)] rounded-[.5rem] mb-[2rem]">
      <button
        type="button"
        className="filter-group__header
         flex justify-between items-center w-full
         py-3 px-4
         bg-[#F8F8F8]
         border-0 border-b border-transparent
         cursor-pointer
         text-left"
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
      >
        <span className="filter-group__label text-[1.6rem] font-semibold text-[rgba(var(--color-foreground))]">
          {filter.label}
          {activeCount > 0 && <span className="filter-group__count"> ({activeCount})</span>}
        </span>
        <span className={`filter-group__arrow ${isExpanded ? 'filter-group__arrow--expanded' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-caret" viewBox="0 0 512 512" fill="currentColor">
            <title>Caret Down</title>
            <path d="M98 190.06l139.78 163.12a24 24 0 0036.44 0L414 190.06c13.34-15.57 2.28-39.62-18.22-39.62h-279.6c-20.5 0-31.56 24.05-18.18 39.62z"></path>
          </svg>
        </span>
      </button>
      {isExpanded && (
        <div className="filter-group__content p-[1.5rem] m-0">
          <div className="filter-group__values">
            {visibleValues.map((value) => (
              <FilterCheckbox
                key={value.id}
                value={value}
                checked={isFilterApplied(currentFilters, value.input as string)}
                onChange={onFilterChange}
              />
            ))}
          </div>
          {hasMoreValues && (
            <button
              type="button"
              className="filter-group__show-more"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll
                ? '- Show less'
                : `+ Show more`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
