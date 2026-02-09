import type {LoaderFunctionArgs} from 'react-router';
import {PRODUCT_ITEM_FRAGMENT} from '~/components/ProductItem';

/**
 * API Route to fetch collection by handle
 * Used by SectionFeaturedCollection component
 *
 * GET /api/collection/:handle?first=8&country=BD&language=EN
 *
 * Query params:
 * - first: Number of products to fetch (default: 8)
 * - country: Override country code for localization (e.g., BD, US)
 * - language: Override language code for localization (e.g., EN, FR)
 */
export async function loader({params, request, context}: LoaderFunctionArgs) {
  const {handle} = params;
  const url = new URL(request.url);
  const first = parseInt(url.searchParams.get('first') || '8', 10);

  // Allow query params to override context i18n (for client-side fetches from localized pages)
  const countryParam = url.searchParams.get('country')?.toUpperCase();
  const languageParam = url.searchParams.get('language')?.toUpperCase();

  if (!handle) {
    return {collection: null, error: 'Collection handle is required'};
  }

  try {
    // Use query params if provided, otherwise fall back to context i18n
    const country = countryParam || context.storefront.i18n.country;
    const language = languageParam || context.storefront.i18n.language;

    const {collection} = await context.storefront.query(COLLECTION_BY_HANDLE_QUERY, {
      variables: {
        handle,
        first,
        country,
        language,
      },
    });

    return {collection};
  } catch (error) {
    console.error('Error fetching collection:', error);
    return {collection: null, error: 'Failed to fetch collection'};
  }
}

const COLLECTION_BY_HANDLE_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query CollectionByHandle(
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
