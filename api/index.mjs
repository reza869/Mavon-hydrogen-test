// Polyfill caches API for Node.js BEFORE importing anything
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

console.log('[api] Polyfill applied, importing server build...');

let serverHandler = null;
let importError = null;

// Try importing at module level, but don't block if it fails
try {
  const mod = await import('../build/server/index.js');
  serverHandler = mod.default;
  console.log('[api] Server build imported successfully');
} catch (e) {
  importError = e;
  console.error('[api] Failed to import server build:', e.message);
}

export default async function handler(req) {
  if (importError) {
    return new Response(`Import Error: ${importError.message}\n${importError.stack}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  if (!serverHandler) {
    return new Response('Server handler not loaded', { status: 500 });
  }

  try {
    console.log('[api] Handling request:', req.method, req.url);

    const url = new URL(req.url, `https://${req.headers.get?.('host') || req.headers.host || 'localhost'}`);

    const request = new Request(url.toString(), {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      duplex: 'half',
    });

    console.log('[api] Calling serverHandler.fetch...');
    const response = await serverHandler.fetch(request, process.env, undefined);
    console.log('[api] Got response:', response.status);

    return response;
  } catch (error) {
    console.error('[api] Handler error:', error.message, error.stack);
    return new Response(`Server Error: ${error.message}\n${error.stack}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
