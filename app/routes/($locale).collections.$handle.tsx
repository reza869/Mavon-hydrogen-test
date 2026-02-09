import {useState} from 'react';
import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {Analytics} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';
import {ProductFilterToolbar, getSortValuesFromParam} from '~/components/ProductFilterToolbar';
import {FilterSidebar, MobileFilterDrawer} from '~/components/FilterSidebar';
import {getFiltersFromURL} from '~/lib/filters';
import type {ProductItemFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Hydrogen | ${data?.collection.title ?? ''} Collection`}];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  // Get URL and parse page parameter
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const pageSize = 8;

  // DEBUG: Log the page being requested
  console.log('=== PAGINATION DEBUG ===');
  console.log('Requested page:', page);
  console.log('Page size:', pageSize);

  // For page-based pagination: fetch enough products to reach the current page
  // Fetch +1 extra product to determine if there's a next page
  const paginationVariables = {
    first: page * pageSize + 1,
  };

  console.log('Fetching first:', page * pageSize + 1, 'products');

  // Get sort parameters from URL
  const sortParam = url.searchParams.get('sort');
  const {sortKey, reverse} = getSortValuesFromParam(sortParam);

  // Get filter parameters from URL
  const filters = getFiltersFromURL(url.searchParams);

  if (!handle) {
    throw redirect('/collections');
  }

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {
        handle,
        ...paginationVariables,
        sortKey,
        reverse,
        filters: filters.length > 0 ? filters : undefined,
      },
      cache: storefront.CacheNone(),
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  // Debug: Log filters returned from Shopify API
  console.log('Collection filters from Shopify:', JSON.stringify(collection.products.filters, null, 2));

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: collection});

  // Slice products to get only current page's products
  const startIndex = (page - 1) * pageSize;
  const endIndex = page * pageSize;
  const allProducts = collection.products.nodes;
  const currentPageProducts = allProducts.slice(startIndex, endIndex);

  // Calculate pagination info based on fetched products
  const hasNextPage = allProducts.length > endIndex;
  const hasPreviousPage = page > 1;

  // DEBUG: Log pagination info
  console.log('=== PAGINATION DEBUG ===');
  console.log('Total products fetched:', allProducts.length);
  console.log('Slicing from index', startIndex, 'to', endIndex);
  console.log('Products for this page:', currentPageProducts.length);
  console.log('First product title:', currentPageProducts[0]?.title);
  console.log('hasNextPage:', hasNextPage);
  console.log('hasPreviousPage:', hasPreviousPage);
  console.log('=== END DEBUG ===');

  return {
    collection: {
      ...collection,
      products: {
        ...collection.products,
        nodes: currentPageProducts,
        pageInfo: {
          ...collection.products.pageInfo,
          hasNextPage,
          hasPreviousPage,
        },
      },
    },
  };
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
  const {collection} = useLoaderData<typeof loader>();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Calculate total product count
  const productCount = collection.products.nodes.length;

  // Get available filters from the collection
  const filters = collection.products.filters || [];

  return (
    <div className="collection page-width mx-auto px-4" data-color-scheme="scheme-1">
      <h1>{collection.title}</h1>
      <p className="collection-description">{collection.description}</p>
      <ProductFilterToolbar
        productCount={productCount}
        onFilterClick={() => setMobileFiltersOpen(true)}
        hasFilters={filters.length > 0}
        availableFilters={filters}
      />
      <div className="collection__content">
        {/* Filter Sidebar - Desktop */}
        {filters.length > 0 && (
          <FilterSidebar filters={filters} />
        )}
        {/* Products Grid */}
        <div className="collection__products">
          <PaginatedResourceSection<ProductItemFragment>
            connection={collection.products}
            resourcesClassName="products-grid grid-cols-4"
          >
            {({node: product, index}) => (
              <ProductItem
                key={product.id}
                product={product}
                loading={index < 8 ? 'eager' : undefined}
              />
            )}
          </PaginatedResourceSection>
        </div>
      </div>
      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        filters={filters}
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
      />
      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor,
        sortKey: $sortKey,
        reverse: $reverse,
        filters: $filters
      ) {
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;
