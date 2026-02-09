import {data} from 'react-router';
import type {Route} from './+types/api.shipping';

/**
 * API Route: /api/shipping
 *
 * This route handles shipping rate calculation using a two-step approach:
 * 1. Add delivery address to cart using cartDeliveryAddressesAdd mutation
 * 2. Query the cart separately to get delivery groups with shipping options
 *
 * Also provides a loader to fetch available countries from Shopify's localization API.
 */

// Step 1: Add delivery address to cart
const CART_DELIVERY_ADDRESSES_ADD = `#graphql
  mutation cartDeliveryAddressesAdd($cartId: ID!, $addresses: [CartSelectableAddressInput!]!) {
    cartDeliveryAddressesAdd(cartId: $cartId, addresses: $addresses) {
      cart {
        id
      }
      userErrors {
        field
        message
      }
      warnings {
        code
        message
      }
    }
  }
` as const;

// Step 2: Query delivery groups separately (without withCarrierRates to avoid @defer requirement)
const CART_DELIVERY_GROUPS_QUERY = `#graphql
  query CartDeliveryGroups($cartId: ID!) {
    cart(id: $cartId) {
      id
      deliveryGroups(first: 10) {
        nodes {
          id
          deliveryOptions {
            handle
            title
            estimatedCost {
              amount
              currencyCode
            }
            description
          }
        }
      }
    }
  }
` as const;

// Localization query for available countries from Shopify Markets
const LOCALIZATION_QUERY = `#graphql
  query ShippingLocalization($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    localization {
      availableCountries {
        isoCode
        name
        currency {
          isoCode
        }
      }
    }
  }
` as const;

// Loader: Fetch available countries from Shopify
export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;

  try {
    const {localization} = await storefront.query(LOCALIZATION_QUERY, {
      variables: {
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
    });

    const countries = localization?.availableCountries || [];
    console.log(`[Shipping API] Loaded ${countries.length} countries from Shopify localization`);

    if (countries.length === 0) {
      console.warn('[Shipping API] No countries returned from localization query. Check your Shopify Markets configuration.');
    }

    return data({
      countries,
    });
  } catch (error) {
    console.error('[Shipping API] Failed to fetch countries:', error);
    return data({countries: []});
  }
}

// Action: Calculate shipping rates
export async function action({request, context}: Route.ActionArgs) {
  const {storefront, cart} = context;

  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent !== 'calculateShipping') {
    return data({success: false, error: 'Invalid intent'}, {status: 400});
  }

  const countryCode = formData.get('countryCode') as string;
  const provinceCode = formData.get('provinceCode') as string;
  const zip = formData.get('zip') as string;

  if (!countryCode) {
    return data({success: false, error: 'Country is required'}, {status: 400});
  }

  if (!zip) {
    return data({success: false, error: 'ZIP/Postal code is required'}, {status: 400});
  }

  try {
    const cartResult = await cart.get();

    if (!cartResult?.id) {
      return data({
        success: false,
        error: 'No cart found. Please add items to your cart first.',
      }, {status: 400});
    }

    if (!cartResult.lines?.nodes?.length) {
      return data({
        success: false,
        error: 'Your cart is empty. Please add items to calculate shipping.',
      }, {status: 400});
    }

    const cartId = cartResult.id;

    // Step 1: Add delivery address to cart
    const {cartDeliveryAddressesAdd} = await storefront.mutate(
      CART_DELIVERY_ADDRESSES_ADD,
      {
        variables: {
          cartId,
          addresses: [
            {
              selected: true,
              address: {
                deliveryAddress: {
                  countryCode: countryCode,
                  provinceCode: provinceCode || '',
                  zip: zip,
                  city: 'City',
                  address1: '123 Street',
                },
              },
            },
          ],
        },
      },
    );

    if (cartDeliveryAddressesAdd?.userErrors?.length) {
      const errorMessages = cartDeliveryAddressesAdd.userErrors
        .map((err: {message: string}) => err.message)
        .join(', ');
      console.error('Shipping address errors:', errorMessages);
      return data({success: false, error: errorMessages}, {status: 400});
    }

    // Log warnings if any (non-blocking)
    if (cartDeliveryAddressesAdd?.warnings?.length) {
      console.warn(
        'Shipping warnings:',
        cartDeliveryAddressesAdd.warnings
          .map((w: {message: string}) => w.message)
          .join(', '),
      );
    }

    // Step 2: Query delivery groups separately
    const {cart: updatedCart} = await storefront.query(
      CART_DELIVERY_GROUPS_QUERY,
      {
        variables: {cartId},
        cache: storefront.CacheNone(),
      },
    );

    const deliveryGroups = updatedCart?.deliveryGroups?.nodes || [];

    if (!deliveryGroups.length) {
      return data({
        success: true,
        deliveryOptions: [],
        message: 'No shipping options available for this address.',
      });
    }

    // Aggregate delivery options from all delivery groups
    const allDeliveryOptions = deliveryGroups.flatMap(
      (group: {
        deliveryOptions: Array<{
          handle: string;
          title: string;
          estimatedCost: {amount: string; currencyCode: string};
          description?: string;
        }>;
      }) => group.deliveryOptions || [],
    );

    // Remove duplicates based on handle
    const uniqueOptions = allDeliveryOptions.filter(
      (option: {handle: string}, index: number, self: Array<{handle: string}>) =>
        index === self.findIndex((o) => o.handle === option.handle),
    );

    return data({
      success: true,
      deliveryOptions: uniqueOptions,
    });
  } catch (error) {
    console.error('Shipping calculation error:', error);
    return data({
      success: false,
      error: 'Unable to calculate shipping rates. Please try again.',
    }, {status: 500});
  }
}
