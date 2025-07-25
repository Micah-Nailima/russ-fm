export function buildCorsHeaders(request, allowedOrigins) {
  const origin = request.headers.get('Origin');
  
  // Check if the origin is allowed
  const isAllowed = allowedOrigins.includes('*') || allowedOrigins.includes(origin);
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin || '*' : 'null',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin'
  };
}

export function applyCorsHeaders(response, corsHeaders) {
  // Skip CORS headers for redirect responses (they have immutable headers)
  if (response.status >= 300 && response.status < 400) {
    return;
  }
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    try {
      response.headers.set(key, value);
    } catch (error) {
      // Headers might be immutable, skip silently
      console.warn('Could not set CORS header:', key, error.message);
    }
  });
}