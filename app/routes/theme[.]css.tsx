import { type LoaderFunctionArgs } from 'react-router';
import { getThemeSettings, generateThemeCSS } from '~/lib/theme-settings.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const isDraft = url.searchParams.get('draft') === 'true';

  const settings = await getThemeSettings(isDraft);
  const css = generateThemeCSS(settings);

  return new Response(css, {
    headers: {
      'Content-Type': 'text/css',
      'Cache-Control': isDraft
        ? 'no-store'
        : 'public, max-age=3600, s-maxage=86400',
    },
  });
}
