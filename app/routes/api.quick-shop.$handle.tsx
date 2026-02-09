import {data, type LoaderFunctionArgs} from 'react-router';

/**
 * API route to fetch product data for quick shop modal
 * Returns product with variants, options, images, and stock info
 */
export async function loader({params, context}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Response('Product handle is required', {status: 400});
  }

  const {product} = await storefront.query(QUICK_SHOP_PRODUCT_QUERY, {
    variables: {handle},
  });

  if (!product) {
    throw new Response('Product not found', {status: 404});
  }

  return data({product});
}

const QUICK_SHOP_VARIANT_FRAGMENT = `#graphql
  fragment QuickShopVariant on ProductVariant {
    availableForSale
    currentlyNotInStock
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
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
    title
    quantityAvailable
  }
` as const;

const QUICK_SHOP_PRODUCT_QUERY = `#graphql
  query QuickShopProduct(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      vendor
      handle
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
            ...QuickShopVariant
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
      selectedOrFirstAvailableVariant(ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
        ...QuickShopVariant
      }
      adjacentVariants {
        ...QuickShopVariant
      }
    }
  }
  ${QUICK_SHOP_VARIANT_FRAGMENT}
` as const;
