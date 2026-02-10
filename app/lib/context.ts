import {createHydrogenContext} from '@shopify/hydrogen';
import {AppSession} from '~/lib/session';
import {CART_QUERY_FRAGMENT} from '~/lib/fragments';
import {getLocaleFromRequest} from '~/lib/i18n';

// Define the additional context object
const additionalContext = {
  // Additional context for custom properties, CMS clients, 3P SDKs, etc.
  // These will be available as both context.propertyName and context.get(propertyContext)
  // Example of complex objects that could be added:
  // cms: await createCMSClient(env),
  // reviews: await createReviewsClient(env),
} as const;

// Automatically augment HydrogenAdditionalContext with the additional context type
type AdditionalContextType = typeof additionalContext;

declare global {
  interface HydrogenAdditionalContext extends AdditionalContextType {}
}

/**
 * Creates Hydrogen context for React Router 7.9.x
 * Compatible with both Shopify Oxygen and Vercel (Node.js) runtimes.
 */
export async function createHydrogenRouterContext(
  request: Request,
  env: Env,
  executionContext?: ExecutionContext,
) {
  // On Vercel, env vars come from process.env instead of the Oxygen env parameter
  const resolvedEnv = env?.SESSION_SECRET
    ? env
    : (process.env as unknown as Env);

  if (!resolvedEnv?.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }

  const waitUntil = executionContext?.waitUntil?.bind(executionContext) ?? (() => {});

  // caches.open() only works on Cloudflare Workers / Oxygen.
  // On Node.js (Vercel), the caches global may exist but hangs, so skip it entirely.
  const isOxygen = Boolean(executionContext?.waitUntil);
  let cache: Cache | undefined;
  if (isOxygen) {
    try {
      cache = await caches.open('hydrogen');
    } catch {
      cache = undefined;
    }
  }

  const session = await AppSession.init(request, [resolvedEnv.SESSION_SECRET]);

  const hydrogenContext = createHydrogenContext(
    {
      env: resolvedEnv,
      request,
      cache,
      waitUntil,
      session,
      i18n: getLocaleFromRequest(request),
      cart: {
        queryFragment: CART_QUERY_FRAGMENT,
      },
    },
    additionalContext,
  );

  return hydrogenContext;
}
