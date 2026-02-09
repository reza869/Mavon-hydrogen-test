import type {Filter, ProductFilter} from '@shopify/hydrogen/storefront-api-types';

export type AppliedFilter = {
  label: string;
  filter: ProductFilter;
};

/**
 * Filter URL parameter prefix
 */
const FILTER_URL_PREFIX = 'filter.';
const VARIANT_URL_PREFIX = 'filter.v.';

/**
 * Parse filters from URL search params
 * Supports clean URL format:
 * - filter.availability=In+stock
 * - filter.price=0-99
 * - filter.productType=Dress
 * - filter.v.Color=Red (variant options)
 */
export function getFiltersFromURL(
  searchParams: URLSearchParams,
): ProductFilter[] {
  const filters: ProductFilter[] = [];

  // Iterate through all params looking for filter.* params
  for (const [key, value] of searchParams.entries()) {
    if (!key.startsWith(FILTER_URL_PREFIX)) continue;

    // Handle variant option filters (filter.v.Color=Red)
    if (key.startsWith(VARIANT_URL_PREFIX)) {
      const optionName = key.slice(VARIANT_URL_PREFIX.length);
      filters.push({
        variantOption: {
          name: optionName,
          value: value,
        },
      });
      continue;
    }

    const filterType = key.slice(FILTER_URL_PREFIX.length);

    // Handle price filter specially
    if (filterType === 'price') {
      const [min, max] = value.split('-').map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        filters.push({price: {min, max}});
      }
      continue;
    }

    // Handle availability filter
    if (filterType === 'availability') {
      filters.push({available: value === 'true' || value === 'In stock'});
      continue;
    }

    // Handle other simple filters (productType, vendor, etc.)
    const filterKey = filterType as keyof ProductFilter;
    filters.push({[filterKey]: value} as ProductFilter);
  }

  return filters;
}

/**
 * Encode filters to URL search params with clean, readable format
 * Supports multiple values: filter.v.Color=Red&filter.v.Color=Blue
 */
export function filtersToSearchParams(
  filters: ProductFilter[],
  existingParams?: URLSearchParams,
): URLSearchParams {
  const params = new URLSearchParams(existingParams);

  // Remove all existing filter.* params
  const keysToDelete: string[] = [];
  for (const key of params.keys()) {
    if (key.startsWith(FILTER_URL_PREFIX)) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach((key) => params.delete(key));

  // Add new filter params (use append for multiple values support)
  for (const filter of filters) {
    // Handle price filter (only one price range allowed)
    if ('price' in filter && filter.price) {
      params.set(`${FILTER_URL_PREFIX}price`, `${filter.price.min}-${filter.price.max}`);
      continue;
    }

    // Handle availability filter
    if ('available' in filter) {
      params.append(`${FILTER_URL_PREFIX}availability`, filter.available ? 'In stock' : 'Out of stock');
      continue;
    }

    // Handle variant option filters (Color, Size, etc.) - supports multiple values
    if ('variantOption' in filter && filter.variantOption) {
      const {name, value} = filter.variantOption;
      params.append(`${VARIANT_URL_PREFIX}${name}`, value);
      continue;
    }

    // Handle other simple filters (productType, vendor, etc.) - supports multiple values
    const filterKey = Object.keys(filter)[0] as keyof ProductFilter;
    const filterValue = filter[filterKey];
    if (typeof filterValue === 'string') {
      params.append(`${FILTER_URL_PREFIX}${filterKey}`, filterValue);
    }
  }

  return params;
}

/**
 * Add or remove a filter from the current filters array
 */
export function toggleFilter(
  currentFilters: ProductFilter[],
  filterInput: string,
  checked: boolean,
): ProductFilter[] {
  const parsedFilter = JSON.parse(filterInput) as ProductFilter;

  if (checked) {
    // Add the filter
    return [...currentFilters, parsedFilter];
  } else {
    // Remove the filter by comparing JSON strings
    return currentFilters.filter(
      (f) => JSON.stringify(f) !== JSON.stringify(parsedFilter),
    );
  }
}

/**
 * Check if a filter value is currently applied
 */
export function isFilterApplied(
  currentFilters: ProductFilter[],
  filterInput: string,
): boolean {
  const parsedFilter = JSON.parse(filterInput) as ProductFilter;
  return currentFilters.some(
    (f) => JSON.stringify(f) === JSON.stringify(parsedFilter),
  );
}

/**
 * Update price range filter
 */
export function updatePriceFilter(
  currentFilters: ProductFilter[],
  min: number,
  max: number,
): ProductFilter[] {
  // Remove any existing price filters
  const filtersWithoutPrice = currentFilters.filter(
    (f) => !('price' in f),
  );

  // Add the new price filter
  return [...filtersWithoutPrice, {price: {min, max}}];
}

/**
 * Get current price range from filters
 */
export function getPriceRangeFromFilters(
  currentFilters: ProductFilter[],
): {min: number; max: number} | null {
  const priceFilter = currentFilters.find((f) => 'price' in f);
  if (priceFilter && 'price' in priceFilter && priceFilter.price) {
    return {
      min: priceFilter.price.min ?? 0,
      max: priceFilter.price.max ?? 0,
    };
  }
  return null;
}

/**
 * Get the maximum price from filter values for price range
 */
export function getMaxPriceFromFilterValues(
  filters: Filter[],
): number {
  const priceFilter = filters.find((f) => f.type === 'PRICE_RANGE');
  if (!priceFilter || !priceFilter.values.length) {
    return 1000; // Default max
  }

  // Parse the input to find the max value
  let maxPrice = 0;
  for (const value of priceFilter.values) {
    try {
      const parsed = JSON.parse(value.input as string) as {price?: {max?: number}};
      if (parsed.price?.max && parsed.price.max > maxPrice) {
        maxPrice = parsed.price.max;
      }
    } catch {
      // Skip invalid JSON
    }
  }

  return maxPrice || 1000;
}

/**
 * Get applied filters with their labels for display
 */
export function getAppliedFiltersWithLabels(
  currentFilters: ProductFilter[],
  availableFilters: Filter[],
): AppliedFilter[] {
  const applied: AppliedFilter[] = [];

  for (const filter of currentFilters) {
    // Handle price filter separately
    if ('price' in filter && filter.price) {
      applied.push({
        label: `$${filter.price.min ?? 0} - $${filter.price.max ?? 0}`,
        filter,
      });
      continue;
    }

    // Find the label from available filters
    for (const availableFilter of availableFilters) {
      for (const value of availableFilter.values) {
        try {
          const parsedInput = JSON.parse(value.input as string);
          if (JSON.stringify(parsedInput) === JSON.stringify(filter)) {
            applied.push({
              label: value.label,
              filter,
            });
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }

  return applied;
}

/**
 * Remove a specific filter
 */
export function removeFilter(
  currentFilters: ProductFilter[],
  filterToRemove: ProductFilter,
): ProductFilter[] {
  return currentFilters.filter(
    (f) => JSON.stringify(f) !== JSON.stringify(filterToRemove),
  );
}

/**
 * Clear all filters
 */
export function clearAllFilters(): ProductFilter[] {
  return [];
}
