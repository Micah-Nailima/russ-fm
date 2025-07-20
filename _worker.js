/**
 * Cloudflare Worker for russ.fm SPA routing
 * Handles client-side routing by serving index.html for non-asset requests
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Handle CORS for API requests if needed
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Try to serve the static asset first
    const response = await env.ASSETS.fetch(request);

    // If the asset exists, return it
    if (response.status !== 404) {
      return response;
    }

    // For 404s, check if this looks like a client-side route
    // (not a file extension and not an API endpoint)
    const isClientRoute = !pathname.includes('.') && 
                         !pathname.startsWith('/api/') &&
                         !pathname.startsWith('/_');

    if (isClientRoute) {
      // Serve index.html for client-side routing
      const indexRequest = new Request(new URL('/', request.url), request);
      const indexResponse = await env.ASSETS.fetch(indexRequest);
      
      if (indexResponse.ok) {
        // Return index.html with proper headers
        return new Response(indexResponse.body, {
          status: 200,
          headers: {
            ...Object.fromEntries(indexResponse.headers),
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        });
      }
    }

    // If we can't serve index.html or it's not a client route, return the 404
    return response;
  },
};
