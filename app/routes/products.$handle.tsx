import { useLoaderData, Await } from 'react-router';
import { Suspense, useState } from 'react';
import type { Route } from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {
  ProductPrice,
  ProductGallery,
  ProductForm,
  NewBadge,
  SaleBadge,
  ProductVendor,
  ProductStock,
  ComplementaryProducts,
  ProductDescription,
  SizeGuideModal,
} from '~/components/product';
import { redirectIfHandleIsLocalized } from '~/lib/redirect';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `Hydrogen | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
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
async function loadCriticalData({
  context,
  params,
  request,
}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  // Fetch size chart page content (non-critical, deferred)
  const sizeChartPromise = context.storefront
    .query(SIZE_CHART_PAGE_QUERY, {
      variables: {handle: 'size-chart'},
    })
    .catch(() => ({page: null}));

  return {
    sizeChart: sizeChartPromise,
  };
}

export default function Product() {
  const {product, sizeChart} = useLoaderData<typeof loader>();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;

  // Accordion state: 'pairs' or 'description' - only one can be open at a time
  const [expandedSection, setExpandedSection] = useState<
    'pairs' | 'description' | null
  >('pairs');

  // Size guide modal state
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  return (
    <div className="container mt-10" data-color-scheme="scheme-1">
      <div
        className="product bg-background"
      >
        {/* Left Column - Product Gallery */}
        <ProductGallery
          images={product.images?.nodes || []}
          selectedVariantImage={selectedVariant?.image}
        />

        {/* Right Column - Product Info */}
        <div className="product-main">
          {/* Vendor */}
          <ProductVendor
            vendor={product.vendor}
            className="mb-4"
            classNameLink="no-underline hover:underline"
            linkToVendor={true}
          />

          {/* Title */}
          <h1 className="mb-8 leading-[1.2] font-heading color-foreground h1">
            {title}
          </h1>

          {/* Price and Badges */}
          <div
            className="product-price-wrapper flex items-center gap-4 mb-8 flex-wrap"
          >
            <ProductPrice
              price={selectedVariant?.price}
              compareAtPrice={selectedVariant?.compareAtPrice}
              groupClassName="flex items-center gap-4"
              className="text-[18px] leading-none text-foreground tracking-[1.3px]"
              compareClassName="text-foreground-75 leading-none"
            />
            <NewBadge
              newUntilDate={product.newBadge?.value}
              colorScheme="scheme-3"
              className="bg-background text-foreground leading-none py-[4px] px-[10px] block rounded-[3px] border border-foreground overflow-hidden text-[13px] tracking-[1px]"
            />
            <SaleBadge
              price={selectedVariant?.price}
              compareAtPrice={selectedVariant?.compareAtPrice}
              availableForSale={selectedVariant?.availableForSale}
              showPercentage={true}
            />
          </div>

          {/* Stock Indicator */}
          <div className='mb-6'>
            <ProductStock
              quantity={selectedVariant?.quantityAvailable ?? 0}
              lowStockThreshold={10}
              availableForSale={selectedVariant?.availableForSale}
              inventoryManagement="shopify"
              inventoryPolicy={selectedVariant?.currentlyNotInStock ? 'continue' : 'deny'}
              showInventoryQuantity={true}
              showProgressBar={true}
            />
          </div>

          {/* Product Form (Options, Quantity, Add to Cart, Buy Now) */}
          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
            onSizeGuideClick={() => setSizeGuideOpen(true)}
          />

          {/* Product Description */}
          <ProductDescription
            descriptionHtml={descriptionHtml}
            title="Product Description"
            isExpanded={expandedSection === 'description'}
            onToggle={() =>
              setExpandedSection (
                expandedSection === 'description' ? null : 'description',
              )
            }
          />

          {/* Complementary Products - Pairs well with */}
          <ComplementaryProducts
            products={product.complementaryProducts?.references?.nodes || []}
            title="Pairs well with"
            itemsPerPage={1}
            isExpanded={expandedSection === 'pairs'}
            onToggle={() =>
              setExpandedSection(
                expandedSection === 'pairs' ? null : 'pairs',
              )
            }
          />

        </div>

        {/* Analytics */}
        <Analytics.ProductView
          data={{
            products: [
              {
                id: product.id,
                title: product.title,
                price: selectedVariant?.price.amount || '0',
                vendor: product.vendor,
                variantId: selectedVariant?.id || '',
                variantTitle: selectedVariant?.title || '',
                quantity: 1,
              },
            ],
          }}
        />
      </div>

      {/* Size Guide Modal */}
      <Suspense fallback={null}>
        <Await resolve={sizeChart}>
          {(resolvedSizeChart) => (
            <SizeGuideModal
              isOpen={sizeGuideOpen}
              onClose={() => setSizeGuideOpen(false)}
              title={resolvedSizeChart?.page?.title || 'Size Guide'}
              content={resolvedSizeChart?.page?.body}
            />
          )}
        </Await>
      </Suspense>
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    currentlyNotInStock
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
    quantityAvailable
  }
` as const;

const COMPLEMENTARY_PRODUCT_FRAGMENT = `#graphql
  fragment ComplementaryProduct on Product {
    id
    title
    handle
    featuredImage {
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 1) {
      nodes {
        id
        availableForSale
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
      }
    }
    options {
      name
      optionValues {
        name
      }
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 10) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
    newBadge: metafield(namespace: "meta", key: "product_new_badge") {
      value
    }
    complementaryProducts: metafield(namespace: "shopify--discovery--product_recommendation", key: "complementary_products") {
      references(first: 10) {
        nodes {
          ... on Product {
            ...ComplementaryProduct
          }
        }
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
  ${COMPLEMENTARY_PRODUCT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const SIZE_CHART_PAGE_QUERY = `#graphql
  query SizeChartPage(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  ) @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      id
      title
      body
    }
  }
` as const;