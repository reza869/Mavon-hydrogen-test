import {Outlet} from 'react-router';
import type {Route} from './+types/($locale)';

/**
 * Locale Layout Route
 *
 * This layout handles the optional ($locale) path segment for internationalization.
 * It matches URLs like /EN-US/, /FR-CA/, /EN-BD/, etc.
 *
 * The locale is extracted from the URL in ~/lib/i18n.ts (getLocaleFromRequest)
 * and made available through the Hydrogen context for GraphQL queries.
 *
 * Child routes:
 * - ($locale)._index.tsx → /$locale/ (homepage)
 * - ($locale).collections.$handle.tsx → /$locale/collections/:handle
 * - ($locale).products.$handle.tsx → /$locale/products/:handle
 * - etc.
 */

export async function loader({params}: Route.LoaderArgs) {
  // Validate locale format (XX-XX pattern like EN-US, FR-CA, EN-BD)
  // The actual locale handling is done by getLocaleFromRequest in ~/lib/i18n.ts
  if (params.locale && !/^[A-Z]{2}-[A-Z]{2}$/i.test(params.locale)) {
    // Invalid locale format - throw 404
    throw new Response(null, {status: 404});
  }

  return null;
}

export default function LocaleLayout() {
  return <Outlet />;
}
