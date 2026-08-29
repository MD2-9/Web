/**
 * @license
 * Copyright 2026 安秋 <github.com/unjal29>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Cloudflare Worker for M2.9 · MDC-Web Showroom
 * Authored by 安秋 (github.com/unjal29)
 * Handles routing, static asset serving, and MIME fallback.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let pathname = url.pathname;
    const assets = env.STATIC_ASSETS || env.ASSETS;

    // 1. Root routing: '/' -> '/demos/index.html'
    if (pathname === '/' || pathname === '/demos' || pathname === '/demos/') {
      pathname = '/demos/index.html';
    }

    // 2. Asset fallback mappings: /assets/* -> /demos/* or /dist/*
    if (pathname.startsWith('/assets/')) {
      const assetFile = pathname.replace('/assets/', '');
      if (assets) {
        try {
          const demoRes = await assets.fetch(new Request(new URL(`/demos/${assetFile}`, request.url).toString()));
          if (demoRes && demoRes.status === 200) {
            return addCorsHeaders(demoRes);
          }
          const distRes = await assets.fetch(new Request(new URL(`/dist/${assetFile}`, request.url).toString()));
          if (distRes && distRes.status === 200) {
            return addCorsHeaders(distRes);
          }
        } catch (e) {
          // Continue to main asset handler
        }
      }
    }

    // 3. Serve via Workers Static Assets binding
    if (assets) {
      try {
        const targetUrl = new URL(pathname, request.url);
        let response = await assets.fetch(new Request(targetUrl.toString()));

        if (!response || response.status === 404) {
          const fallbackUrl = new URL('/demos/index.html', request.url);
          response = await assets.fetch(new Request(fallbackUrl.toString()));
        }

        return addCorsHeaders(response);
      } catch (err) {
        return new Response('Asset fetch error: ' + err.message, { status: 500 });
      }
    }

    return new Response('M2.9 Showroom is active.', {
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
