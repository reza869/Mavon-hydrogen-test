import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {homepageLoader, type HomepageLoaderData} from '~/lib/homepage.server';
import {Homepage} from '~/components/Homepage';

/**
 * Homepage Route (Localized)
 * Handles requests to locale-prefixed URLs: /en/, /fr/, /de/, etc.
 *
 * The ($locale) segment is an optional dynamic parameter that captures
 * the locale prefix from the URL for internationalization support.
 *
 * Uses shared loader and component from:
 * - ~/lib/homepage.server.ts (data fetching)
 * - ~/components/Homepage.tsx (UI rendering)
 */

export const meta: Route.MetaFunction = () => {
  return [{title: 'Hydrogen | Home'}];
};

export async function loader({context}: Route.LoaderArgs): Promise<HomepageLoaderData> {
  // The locale is automatically handled by the Hydrogen context
  // via getLocaleFromRequest in ~/lib/context.ts
  return homepageLoader(context);
}

export default function LocalizedHomepageRoute() {
  const data = useLoaderData<typeof loader>();
  return <Homepage data={data} />;
}
