import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
  useLocation,
} from 'react-router';
import type {Route} from './+types/root';
import favicon from '~/assets/favicon.svg';
import {FOOTER_QUERY, HEADER_QUERY, LOCALIZATION_QUERY} from '~/lib/fragments';
import {PageLayout} from './components/PageLayout';

// Mavon Styling System - Import order matters!
// 1. Variables (root CSS variables)
// 2. Color schemes (color system)
// 3. Tailwind (utility framework)
// 4. Base (Mavon base styles, typography, components)
// 5. App (component-specific overrides)
// 6. Sections (homepage section styles)
// 7. Swiper (slider library styles)
import tailwindCss from '~/styles/tailwind.css?url';
import variablesStyles from '~/styles/variables.css?url';
import colorSchemeStyles from '~/styles/color-schemes.css?url';
import baseStyles from '~/styles/base.css?url';
import appStyles from '~/styles/app.css?url';
import sectionsStyles from '~/styles/sections.css?url';
import swiperStyles from 'swiper/css?url';
import swiperNavigationStyles from 'swiper/css/navigation?url';
import swiperPaginationStyles from 'swiper/css/pagination?url';

export type RootLoader = typeof loader;

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    // Shopify CDN preconnects
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    // Favicon
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
}

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env} = args.context;

  return {
    ...deferredData,
    ...criticalData,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const [header, localization] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu', // Adjust to your header menu handle
      },
    }),
    storefront.query(LOCALIZATION_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
    }),
  ]);

  return {
    header,
    localization: {
      countries: localization?.localization?.availableCountries || [],
      languages: localization?.localization?.availableLanguages || [],
      currentCountry: storefront.i18n.country,
      currentLanguage: storefront.i18n.language,
    },
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const {storefront, customerAccount, cart} = context;

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer', // Adjust to your footer menu handle
      },
    })
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();

  return (
    <html lang="en" className="no-js">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        {/* Google Fonts - Must load BEFORE CSS that references them */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/*
          Load only the weights Mavon actually uses:
          - Lato: 400 (normal), 700 (bold) - normal & italic
          - Chivo: 400, 500, 600, 700 - for headings
        */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Chivo:wght@400;700&family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap"
        />
        {/* Mavon Styling System - Order matters! */}
        <link rel="stylesheet" href={variablesStyles} />
        <link rel="stylesheet" href={colorSchemeStyles} />
        <link rel="stylesheet" href={tailwindCss} />
        <link rel="stylesheet" href={baseStyles} />
        <link rel="stylesheet" href={appStyles} />
        <link rel="stylesheet" href={sectionsStyles} />
        {/* Swiper Slider Styles */}
        <link rel="stylesheet" href={swiperStyles} />
        <link rel="stylesheet" href={swiperNavigationStyles} />
        <link rel="stylesheet" href={swiperPaginationStyles} />
        <Links />
        {/* Remove no-js class when JavaScript loads */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.className = document.documentElement.className.replace('no-js', 'js');`,
          }}
        />
      </head>
      <body className="gradient">
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');
  const location = useLocation();

  // Check if we're on an admin route - these should not have store layout
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (!data) {
    return <Outlet />;
  }

  // Admin routes render without the store layout (header, footer, etc.)
  if (isAdminRoute) {
    return <Outlet />;
  }

  return (
    <Analytics.Provider
      cart={data.cart}
      shop={data.shop}
      consent={data.consent}
    >
      <PageLayout {...data}>
        <Outlet />
      </PageLayout>
    </Analytics.Provider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="route-error">
      <h1>Oops</h1>
      <h2>{errorStatus}</h2>
      {errorMessage && (
        <fieldset>
          <pre>{errorMessage}</pre>
        </fieldset>
      )}
    </div>
  );
}
