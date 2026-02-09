import serverHandler from '../build/server/index.js';

export default async function handler(req) {
  const url = new URL(req.url, `https://${req.headers.get?.('host') || req.headers.host || 'localhost'}`);

  // Build a Web API Request from the incoming request
  const request = new Request(url.toString(), {
    method: req.method,
    headers: req.headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    duplex: 'half',
  });

  // Call Hydrogen's server handler
  const response = await serverHandler.fetch(request, {}, undefined);

  return response;
}
