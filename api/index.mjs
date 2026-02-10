// Polyfill caches API for Node.js BEFORE importing anything
// @shopify/hydrogen internals use caches.open() which hangs on Node.js 24.x
const noopCache = {
  match: async () => undefined,
  put: async () => {},
  delete: async () => false,
  keys: async () => [],
  add: async () => {},
  addAll: async () => {},
};

globalThis.caches = {
  open: async () => noopCache,
  match: async () => undefined,
  has: async () => false,
  delete: async () => false,
  keys: async () => [],
};

// Use dynamic import so the polyfill is applied BEFORE the module loads
const serverModule = await import('../build/server/index.js');
const serverHandler = serverModule.default;

export default async function handler(req) {
  try {
    const url = new URL(req.url, `https://${req.headers.get?.('host') || req.headers.host || 'localhost'}`);

    const request = new Request(url.toString(), {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      duplex: 'half',
    });

    const response = await serverHandler.fetch(request, process.env, undefined);
    return response;
  } catch (error) {
    console.error('Serverless function error:', error);
    return new Response(`Server Error: ${error.message}`, { status: 500 });
  }
}
