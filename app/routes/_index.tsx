import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {homepageLoader, type HomepageLoaderData} from '~/lib/homepage.server';
import {Homepage} from '~/components/Homepage';

/**
 * Homepage Route (Non-localized)
 * Handles requests to the root URL: /
 *
 * Uses shared loader and component from:
 * - ~/lib/homepage.server.ts (data fetching)
 * - ~/components/Homepage.tsx (UI rendering)
 */

export const meta: Route.MetaFunction = () => {
  return [{title: 'Hydrogen | Home'}];
};

export async function loader({context, request}: Route.LoaderArgs): Promise<HomepageLoaderData> {
  // Check for draft mode (used by admin preview)
  const url = new URL(request.url);
  const isDraft = url.searchParams.get('draft') === 'true';
  return homepageLoader(context, isDraft);
}

export default function HomepageRoute() {
  const data = useLoaderData<typeof loader>();
  return <Homepage data={data} />;
}
