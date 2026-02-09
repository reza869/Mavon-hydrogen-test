import type {Route} from './+types/collections.all';
import {useLoaderData, data} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem, PRODUCT_ITEM_FRAGMENT, type ProductItemData} from '~/components/ProductItem';
import {ProductFilterToolbar, getSortValuesFromParam} from '~/components/ProductFilterToolbar';

export const meta: Route.MetaFunction = () => {
  return [{title: `Hydrogen | Products`}];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return data({...deferredData, ...criticalData});
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  // Get sort parameters from URL
  const url = new URL(request.url);
  const sortParam = url.searchParams.get('sort');
  const {sortKey, reverse} = getSortValuesFromParam(sortParam);

  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY_ALL, {
      variables: {...paginationVariables, sortKey, reverse},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);
  return {products};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Collection() {
  const {products} = useLoaderData<typeof loader>();

  // Calculate total product count
  const productCount = products.nodes.length;

  return (
    <div className="collection page-width mx-auto px-4" data-color-scheme="scheme-1">
      <h1>Products</h1>
      <ProductFilterToolbar productCount={productCount} />
      <PaginatedResourceSection
        connection={products}
        resourcesClassName="products-grid grid-cols-4"
      >
        {({node: product, index}: {node: ProductItemData; index: number}) => (
          <ProductItem
            key={product.id}
            product={product}
            loading={index < 8 ? 'eager' : 'lazy'}
            // Image settings
            imageRatio="3/4"
            roundedCorners={true}
            cornerRadius={8}
            showSecondImageOnHover={true}
            // Product info visibility
            showTitle={true}
            showPrice={true}
            showVendor={false}
            showRating={false}
            // Badges
            showBadges={true}
            badgePosition="top-left"
            // Quick shop
            enableQuickShop={true}
            quickShopStyle="icon-button"
            quickShopPosition="bottom-right"
            // Add to cart
            enableAddToCart={true}
            addToCartStyle="icon-button"
            addToCartPosition="bottom-right"
            // Other features
            showCountdown={true}
            enableColorSwatches={true}
            maxSwatches={4}
          />
        )}
      </PaginatedResourceSection>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/product
const CATALOG_QUERY_ALL = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query CatalogAll(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor, sortKey: $sortKey, reverse: $reverse) {
      nodes {
        ...ProductItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
` as const;
