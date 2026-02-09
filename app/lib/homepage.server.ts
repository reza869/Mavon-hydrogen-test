import type {AppLoadContext} from 'react-router';
import {PRODUCT_ITEM_FRAGMENT, type ProductItemData} from '~/components/ProductItem';
import {getSlideshowSettings} from '~/lib/theme-settings.server';
import type {SlideshowSettings} from '~/types/theme-settings';

/**
 * Homepage Loader Module
 * Centralizes all homepage data fetching for both localized and non-localized routes
 * This ensures consistent behavior across _index.tsx and ($locale)._index.tsx
 */

// ============================================================================
// Types
// ============================================================================

export interface HomepageLoaderData {
  /** Featured collection for hero section */
  featuredCollection: FeaturedCollectionData | null;
  /** Deferred: Recommended products */
  recommendedProducts: Promise<RecommendedProductsData | null>;
  /** Deferred: Featured collection products for slider section */
  featuredCollectionProducts: Promise<FeaturedCollectionProductsData | null>;
  /** Slideshow settings from dashboard */
  slideshowSettings: SlideshowSettings | null;
}

export interface FeaturedCollectionData {
  id: string;
  title: string;
  handle: string;
  image?: {
    id: string;
    url: string;
    altText?: string | null;
    width: number;
    height: number;
  } | null;
}

export interface RecommendedProductsData {
  products: {
    nodes: ProductItemData[];
  };
}

export interface FeaturedCollectionProductsData {
  collection: {
    id: string;
    handle: string;
    title: string;
    description: string;
    products: {
      nodes: ProductItemData[];
    };
  } | null;
}

// ============================================================================
// GraphQL Queries
// ============================================================================

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...ProductItem
      }
    }
  }
` as const;

const FEATURED_COLLECTION_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query FeaturedCollectionProducts(
    $handle: String!
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(first: $first) {
        nodes {
          ...ProductItem
        }
      }
    }
  }
` as const;

// ============================================================================
// Loader Functions
// ============================================================================

/**
 * Load critical data required for initial page render
 * This data is awaited and blocks time to first byte
 * If unavailable, the page should 400 or 500 error
 */
async function loadCriticalData(context: AppLoadContext): Promise<{
  featuredCollection: FeaturedCollectionData | null;
}> {
  const {storefront} = context;
  const {language, country} = storefront.i18n;

  const [{collections}] = await Promise.all([
    storefront.query(FEATURED_COLLECTION_QUERY, {
      variables: {country, language},
    }),
    // Add other critical queries here to load in parallel
  ]);

  return {
    featuredCollection: collections.nodes[0] ?? null,
  };
}

/**
 * Load deferred data for content below the fold
 * This data is fetched after initial page load
 * If unavailable, the page should still 200
 * Errors are caught and logged, not thrown
 */
function loadDeferredData(context: AppLoadContext): {
  recommendedProducts: Promise<RecommendedProductsData | null>;
  featuredCollectionProducts: Promise<FeaturedCollectionProductsData | null>;
} {
  const {storefront} = context;
  const {language, country} = storefront.i18n;

  const recommendedProducts = storefront
    .query(RECOMMENDED_PRODUCTS_QUERY, {
      variables: {country, language},
    })
    .catch((error: Error) => {
      console.error('Recommended products query error:', error);
      return null;
    });

  const featuredCollectionProducts = storefront
    .query(FEATURED_COLLECTION_PRODUCTS_QUERY, {
      variables: {
        handle: 'all', // Change this to your featured collection handle
        first: 8,
        country,
        language,
      },
    })
    .catch((error: Error) => {
      console.error('Featured collection products error:', error);
      return null;
    });

  return {
    recommendedProducts,
    featuredCollectionProducts,
  };
}

/**
 * Main homepage loader function
 * Combines critical and deferred data loading
 * Use this in both _index.tsx and ($locale)._index.tsx routes
 * @param context - App load context
 * @param isDraft - If true, load draft settings (for admin preview), otherwise load published settings
 */
export async function homepageLoader(
  context: AppLoadContext,
  isDraft: boolean = false,
): Promise<HomepageLoaderData> {
  // Start deferred data fetching (non-blocking)
  const deferredData = loadDeferredData(context);

  // Await critical data (blocking)
  const criticalData = await loadCriticalData(context);

  // Get slideshow settings from dashboard
  // isDraft=true for admin preview, isDraft=false for live site (published version)
  const slideshowSettings = await getSlideshowSettings('index', isDraft) as SlideshowSettings | null;

  return {
    ...criticalData,
    ...deferredData,
    slideshowSettings,
  };
}

// ============================================================================
// Re-export queries for potential direct use
// ============================================================================

export {
  FEATURED_COLLECTION_QUERY,
  RECOMMENDED_PRODUCTS_QUERY,
  FEATURED_COLLECTION_PRODUCTS_QUERY,
};
