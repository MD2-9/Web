/**
 * Cloudflare Worker for M2.9 · MDC-Web Showroom
 * Authored by 安秋 (github.com/unjal29)
 * Handles routing, static asset serving, MIME types, and fallback.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let pathname = url.pathname;

    // 1. Root & demo routing: '/' or '/demos' -> '/demos/index.html'
    if (pathname === '/' || pathname === '/demos' || pathname === '/demos/') {
      pathname = '/demos/index.html';
      url.pathname = pathname;
    }

    // 2. Asset fallback mappings
    if (pathname.startsWith('/assets/')) {
      const assetFile = pathname.replace('/assets/', '');
      // Try /demos/<file> first, then /dist/<file>
      const demoUrl = new URL(`/demos/${assetFile}`, request.url);
      const demoRes = await env.ASSETS ? env.ASSETS.fetch(new Request(demoUrl, request)) : fetch(demoUrl);
      if (demoRes && demoRes.status === 200) {
        return addCorsHeaders(demoRes);
      }
      
      const distUrl = new URL(`/dist/${assetFile}`, request.url);
      const distRes = await env.ASSETS ? env.ASSETS.fetch(new Request(distUrl, request)) : fetch(distUrl);
      if (distRes && distRes.status === 200) {
        return addCorsHeaders(distRes);
      }
    }

    // 3. Serve via Workers Static Assets binding
    if (env.ASSETS) {
      const assetRequest = new Request(url.toString(), request);
      let response = await env.ASSETS.fetch(assetRequest);

      // If not found, fallback to /demos/index.html
      if (!response || response.status === 404) {
        const fallbackUrl = new URL('/demos/index.html', request.url);
        response = await env.ASSETS.fetch(new Request(fallbackUrl, request));
      }

      return addCorsHeaders(response);
    }

    // Direct fetch fallback
    return new Response('M2.9 Showroom is active. Use wrangler deploy with [assets] configuration.', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
};

function addCorsHeaders(response) {
  if (!response) return response;
  const newHeaders = new Headers(response.headers);
  newHeaders.set('Access-Control-Allow-Origin', '*');
  newHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  newHeaders.set('X-Content-Type-Options', 'nosniff');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}
