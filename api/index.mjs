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

let serverHandler = null;
let importError = null;

try {
  const mod = await import('../build/server/index.js');
  serverHandler = mod.default;
} catch (e) {
  importError = e;
  console.error('[api] Failed to import server build:', e.message);
}

/**
 * Vercel Web Standard fetch handler.
 * Using the `export default { fetch() }` pattern tells Vercel
 * to treat this as a Web Standard handler that receives a Web Request
 * and returns a Web Response (not the legacy req/res pattern).
 */
export default {
  async fetch(request) {
    return handleRequest(request);
  },
};

/**
 * Named HTTP method exports as fallback.
 * Vercel recognizes GET, POST, PUT, DELETE, etc. as Web Standard handlers.
 */
export async function GET(request) {
  return handleRequest(request);
}

export async function POST(request) {
  return handleRequest(request);
}

export async function PUT(request) {
  return handleRequest(request);
}

export async function DELETE(request) {
  return handleRequest(request);
}

export async function PATCH(request) {
  return handleRequest(request);
}

async function handleRequest(request) {
  if (importError) {
    return new Response(
      `Import Error: ${importError.message}\n${importError.stack}`,
      { status: 500, headers: { 'Content-Type': 'text/plain' } },
    );
  }

  if (!serverHandler) {
    return new Response('Server handler not loaded', { status: 500 });
  }

  try {
    const response = await serverHandler.fetch(request, process.env, undefined);
    return response;
  } catch (error) {
    console.error('[api] Handler error:', error.message, error.stack);
    return new Response(
      `Server Error: ${error.message}\n${error.stack}`,
      { status: 500, headers: { 'Content-Type': 'text/plain' } },
    );
  }
}
