import {data} from 'react-router';
import type {LoaderFunctionArgs} from 'react-router';

/**
 * API Route to fetch collections
 * Used by SectionCollectionList component
 *
 * Mode 1: Fetch all collections with limit
 * GET /api/collections?limit=15&country=BD&language=EN
 *
 * Mode 2: Fetch specific collections by handles (legacy)
 * GET /api/collections?handles=collection1,collection2,collection3&country=BD&language=EN
 *
 * Query params:
 * - limit: Maximum number of collections to fetch (default: 15, max: 250)
 * - handles: Comma-separated collection handles (optional, overrides limit mode)
 * - country: Override country code for localization (e.g., BD, US)
 * - language: Override language code for localization (e.g., EN, FR)
 */
export async function loader({request, context}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const handlesParam = url.searchParams.get('handles') || '';
  const handles = handlesParam.split(',').filter(Boolean);
  const limitParam = url.searchParams.get('limit');
  const limit = Math.min(Math.max(parseInt(limitParam || '15', 10), 1), 250);

  // Allow query params to override context i18n (for client-side fetches from localized pages)
  const countryParam = url.searchParams.get('country')?.toUpperCase();
  const languageParam = url.searchParams.get('language')?.toUpperCase();

  try {
    // Use query params if provided, otherwise fall back to context i18n
    const country = countryParam || context.storefront.i18n.country;
    const language = languageParam || context.storefront.i18n.language;

    // Mode 1: Fetch specific collections by handles
    if (handles.length > 0) {
      const collectionPromises = handles.map(async (handle) => {
        const {collection} = await context.storefront.query(COLLECTION_BY_HANDLE_QUERY, {
          variables: {
            handle,
            country,
            language,
          },
        });
        return collection;
      });

      const collections = (await Promise.all(collectionPromises)).filter(Boolean);
      return data({collections});
    }

    // Mode 2: Fetch all collections with limit
    const {collections: collectionsData} = await context.storefront.query(
      ALL_COLLECTIONS_QUERY,
      {
        variables: {
          first: limit,
          country,
          language,
        },
      },
    );

    const collections = collectionsData?.nodes || [];
    return data({collections});
  } catch (error) {
    console.error('Error fetching collections:', error);
    return data({collections: [], error: 'Failed to fetch collections'});
  }
}

const COLLECTION_BY_HANDLE_QUERY = `#graphql
  query CollectionByHandle(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        id
        url
        altText
        width
        height
      }
      products(first: 250) {
        nodes {
          id
        }
      }
    }
  }
` as const;

const ALL_COLLECTIONS_QUERY = `#graphql
  query AllCollections(
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collections(first: $first) {
      nodes {
        id
        handle
        title
        description
        image {
          id
          url
          altText
          width
          height
        }
        products(first: 250) {
          nodes {
            id
          }
        }
      }
    }
  }
` as const;
