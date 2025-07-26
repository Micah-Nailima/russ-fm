import { generateSessionId, createAuthUrl, generateApiSig } from '../utils/lastfm.js';

export async function handleAuth(request, env, path) {
  const url = new URL(request.url);
  
  if (path === '/api/auth/status') {
    return handleAuthStatus(request, env);
  } else if (path === '/api/auth/login') {
    return handleLogin(request, env);
  } else if (path === '/api/auth/callback') {
    return handleCallback(request, env, url);
  } else if (path === '/api/auth/exchange') {
    return handleTokenExchange(request, env, url);
  } else if (path === '/api/auth/logout') {
    return handleLogout(request, env);
  }
  
  return new Response('Auth endpoint not found', { status: 404 });
}

async function handleAuthStatus(request, env) {
  try {
    const sessionId = getSessionFromRequest(request);
    
    if (!sessionId) {
      return Response.json({ authenticated: false });
    }
    
    const sessionData = await env.SESSIONS.get(sessionId);
    
    if (!sessionData) {
      return Response.json({ authenticated: false });
    }
    
    const session = JSON.parse(sessionData);
    
    // Check if session is expired (30 days)
    if (Date.now() - session.created > 30 * 24 * 60 * 60 * 1000) {
      await env.SESSIONS.delete(sessionId);
      return Response.json({ authenticated: false });
    }
    
    return Response.json({
      authenticated: true,
      user: {
        username: session.username,
        sessionKey: session.sessionKey,
        userInfo: session.userInfo || null, // Include full user info if available
        userAvatar: session.userAvatar || null, // Include proxied user avatar
        lastAlbumArt: session.lastAlbumArt || null // Include latest album artwork
      }
    });
  } catch (error) {
    console.error('Auth status error:', error);
    return Response.json({ authenticated: false });
  }
}

async function handleLogin(request, env) {
  try {
    // Debug: Check if API key is available
    console.log('LASTFM_API_KEY available:', !!env.LASTFM_API_KEY);
    console.log('LASTFM_API_KEY value:', env.LASTFM_API_KEY ? 'SET' : 'UNDEFINED');
    
    if (!env.LASTFM_API_KEY) {
      return Response.json({ 
        error: 'Last.fm API key not configured. Please set LASTFM_API_KEY secret.' 
      }, { status: 500 });
    }
    
    const sessionId = generateSessionId();
    const authStateId = generateSessionId(); // Separate ID for auth state
    
    // Get the current origin and determine callback URL
    const url = new URL(request.url);
    const referer = request.headers.get('Referer');
    
    // Store the original referer origin for post-auth redirect
    let redirectOrigin = url.origin;
    if (referer) {
      const refererUrl = new URL(referer);
      redirectOrigin = refererUrl.origin;
    }
    
    // Use production callback URL with auth state ID
    let callbackUrl = `https://russ.fm/api/auth/callback?state=${authStateId}`;
    
    console.log('Creating auth URL with callback:', callbackUrl);
    const authUrl = createAuthUrl(env.LASTFM_API_KEY, callbackUrl);
    console.log('Generated auth URL:', authUrl);
    
    // Store auth state separately (accessible by state ID, not cookie)
    await env.SESSIONS.put(`auth_state_${authStateId}`, JSON.stringify({
      type: 'auth_pending',
      sessionId: sessionId,
      created: Date.now(),
      redirectOrigin: redirectOrigin,
      isEmbed: referer && referer.includes('/embed/')
    }), { expirationTtl: 600 }); // 10 minutes
    
    // Store user session (for the final authenticated session)
    await env.SESSIONS.put(sessionId, JSON.stringify({
      type: 'pending',
      created: Date.now()
    }), { expirationTtl: 600 }); // 10 minutes
    
    const response = Response.json({ authUrl });
    
    // Set session cookie (adjust for localhost)
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const cookieOptions = isLocalhost 
      ? `session_id=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000`
      : `session_id=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000`;
    
    response.headers.set('Set-Cookie', cookieOptions);
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Login failed' }, { status: 500 });
  }
}

async function handleCallback(request, env, url) {
  try {
    const token = url.searchParams.get('token');
    const state = url.searchParams.get('state');
    
    console.log('Callback debug:', { 
      hasToken: !!token, 
      token: token?.substring(0, 10) + '...',
      hasState: !!state,
      state: state?.substring(0, 10) + '...'
    });
    
    if (!token || !state) {
      return Response.json({ 
        success: false, 
        error: `Missing token or state. Token: ${!!token}, State: ${!!state}` 
      }, { status: 400 });
    }
    
    // Get auth state from KV
    const authStateData = await env.SESSIONS.get(`auth_state_${state}`);
    if (!authStateData) {
      return Response.json({ 
        success: false, 
        error: 'Invalid or expired auth state' 
      }, { status: 400 });
    }
    
    const authState = JSON.parse(authStateData);
    const sessionId = authState.sessionId;
    
    // Get session key from LastFM
    const sessionKey = await getSessionKey(token, env.LASTFM_API_KEY, env.LASTFM_SECRET);
    
    if (!sessionKey) {
      return Response.json({ 
        success: false, 
        error: 'Failed to get session key' 
      }, { status: 400 });
    }
    
    // Get user info
    const userInfo = await getUserInfo(sessionKey, env.LASTFM_API_KEY, env.LASTFM_SECRET);
    
    if (!userInfo) {
      return Response.json({ 
        success: false, 
        error: 'Failed to get user info' 
      }, { status: 400 });
    }
    
    // Get user avatar from profile
    let userAvatar = null;
    if (userInfo && userInfo.image) {
      // According to Last.fm docs, image is a single URL string
      if (Array.isArray(userInfo.image) && userInfo.image.length > 0) {
        // Handle array format (multiple sizes)
        const largeAvatar = userInfo.image.find(img => img.size === 'extralarge') ||
                           userInfo.image.find(img => img.size === 'large') ||
                           userInfo.image.find(img => img.size === 'medium') ||
                           userInfo.image[0];
        
        if (largeAvatar && largeAvatar['#text']) {
          userAvatar = largeAvatar['#text'];
        }
      } else if (typeof userInfo.image === 'string') {
        // Handle string format (single URL)
        userAvatar = userInfo.image;
      }
    }
    
    // Get user's recent tracks for album artwork
    const recentTracks = await getUserRecentTracks(sessionKey, env.LASTFM_API_KEY, env.LASTFM_SECRET, 1);
    let lastAlbumArt = null;
    
    if (recentTracks && recentTracks.length > 0) {
      const latestTrack = Array.isArray(recentTracks) ? recentTracks[0] : recentTracks;
      if (latestTrack.image && latestTrack.image.length > 0) {
        // Find the largest available image
        const largeImage = latestTrack.image.find(img => img.size === 'extralarge') ||
                          latestTrack.image.find(img => img.size === 'large') ||
                          latestTrack.image.find(img => img.size === 'medium') ||
                          latestTrack.image[0];
        
        if (largeImage && largeImage['#text']) {
          lastAlbumArt = largeImage['#text'];
        }
      }
    }
    
    // Store authenticated session with full user info
    await env.SESSIONS.put(sessionId, JSON.stringify({
      type: 'authenticated',
      username: userInfo.name,
      userInfo: userInfo, // Store full user info from Last.fm
      userAvatar: userAvatar, // Store proxied user avatar URL
      lastAlbumArt: lastAlbumArt, // Store latest album artwork
      sessionKey: sessionKey,
      created: Date.now()
    }), { expirationTtl: 2592000 }); // 30 days
    
    // Clean up auth state
    await env.SESSIONS.delete(`auth_state_${state}`);
    
    // For cross-domain scenarios (like localhost development),
    // include the sessionId in the redirect URL so the frontend can use it
    const redirectUrl = authState.redirectOrigin + '/';
    const isLocalhost = authState.redirectOrigin.includes('localhost');
    
    if (isLocalhost) {
      // For localhost, include sessionId as URL parameter
      const redirectWithToken = new URL(redirectUrl);
      redirectWithToken.searchParams.set('auth_session', sessionId);
      return Response.redirect(redirectWithToken.toString(), 302);
    } else {
      // For same-domain, cookies work fine
      return Response.redirect(redirectUrl, 302);
    }
  } catch (error) {
    console.error('Callback error:', error);
    return Response.json({ 
      success: false, 
      error: 'Authentication failed' 
    }, { status: 500 });
  }
}

async function handleTokenExchange(request, env, url) {
  try {
    const sessionToken = url.searchParams.get('session');
    
    if (!sessionToken) {
      return Response.json({ 
        success: false, 
        error: 'Missing session token' 
      }, { status: 400 });
    }
    
    // Get session data from KV
    const sessionData = await env.SESSIONS.get(sessionToken);
    
    if (!sessionData) {
      return Response.json({ 
        authenticated: false 
      });
    }
    
    const session = JSON.parse(sessionData);
    
    // Check if session is expired (30 days)
    if (Date.now() - session.created > 30 * 24 * 60 * 60 * 1000) {
      await env.SESSIONS.delete(sessionToken);
      return Response.json({ 
        authenticated: false 
      });
    }
    
    return Response.json({
      authenticated: true,
      user: {
        username: session.username,
        sessionKey: session.sessionKey,
        userInfo: session.userInfo || null,
        userAvatar: session.userAvatar || null,
        lastAlbumArt: session.lastAlbumArt || null
      }
    });
  } catch (error) {
    console.error('Token exchange error:', error);
    return Response.json({ 
      success: false, 
      error: 'Token exchange failed' 
    }, { status: 500 });
  }
}

async function handleLogout(request, env) {
  try {
    const sessionId = getSessionFromRequest(request);
    
    if (sessionId) {
      await env.SESSIONS.delete(sessionId);
    }
    
    const response = Response.json({ success: true });
    
    // Clear session cookie
    response.headers.set('Set-Cookie', 
      'session_id=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
    );
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return Response.json({ error: 'Logout failed' }, { status: 500 });
  }
}


function getSessionFromRequest(request) {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});
  
  return cookies.session_id;
}

async function getSessionKey(token, apiKey, secret) {
  try {
    const params = {
      method: 'auth.getSession',
      api_key: apiKey,
      token: token
    };
    
    const signature = generateApiSig(params, secret);
    params.api_sig = signature;
    params.format = 'json';
    
    const response = await fetch('https://ws.audioscrobbler.com/2.0/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params)
    });
    
    const data = await response.json();
    
    if (data.session && data.session.key) {
      return data.session.key;
    }
    
    return null;
  } catch (error) {
    console.error('Get session key error:', error);
    return null;
  }
}

async function getUserInfo(sessionKey, apiKey, secret) {
  try {
    const params = {
      method: 'user.getInfo',
      api_key: apiKey,
      sk: sessionKey
    };
    
    const signature = generateApiSig(params, secret);
    params.api_sig = signature;
    params.format = 'json';
    
    const response = await fetch('https://ws.audioscrobbler.com/2.0/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params)
    });
    
    const data = await response.json();
    
    if (data.user) {
      return data.user;
    }
    
    return null;
  } catch (error) {
    console.error('Get user info error:', error);
    return null;
  }
}

async function getUserRecentTracks(sessionKey, apiKey, secret, limit = 1) {
  try {
    const params = {
      method: 'user.getRecentTracks',
      api_key: apiKey,
      sk: sessionKey,
      limit: limit.toString()
    };
    
    const signature = generateApiSig(params, secret);
    params.api_sig = signature;
    params.format = 'json';
    
    const response = await fetch('https://ws.audioscrobbler.com/2.0/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params)
    });
    
    const data = await response.json();
    
    if (data.recenttracks && data.recenttracks.track) {
      return data.recenttracks.track;
    }
    
    return null;
  } catch (error) {
    console.error('Get recent tracks error:', error);
    return null;
  }
}