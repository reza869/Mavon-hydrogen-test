// Virtual entry point for the app
import {storefrontRedirect} from '@shopify/hydrogen';
import {createRequestHandler} from 'react-router';
import {createHydrogenRouterContext} from '~/lib/context';

// Re-export the server build manifest for adapters
// eslint-disable-next-line import/no-unresolved
export * from 'virtual:react-router/server-build';

// eslint-disable-next-line import/no-unresolved
const build = import('virtual:react-router/server-build');

/**
 * Export a fetch handler in module format.
 * Uses React Router's standard createRequestHandler (not Oxygen-specific).
 */
export default {
  async fetch(
    request: Request,
    env: Env,
    executionContext?: ExecutionContext,
  ): Promise<Response> {
    try {
      const hydrogenContext = await createHydrogenRouterContext(
        request,
        env,
        executionContext,
      );

      const handleRequest = createRequestHandler(
        await build,
        process.env.NODE_ENV,
      );

      const response = await handleRequest(request, hydrogenContext as any);

      if (hydrogenContext.session.isPending) {
        response.headers.set(
          'Set-Cookie',
          await hydrogenContext.session.commit(),
        );
      }

      if (response.status === 404) {
        return storefrontRedirect({
          request,
          response,
          storefront: hydrogenContext.storefront,
        });
      }

      return response;
    } catch (error) {
      console.error(error);
      return new Response('An unexpected error occurred', {status: 500});
    }
  },
};
