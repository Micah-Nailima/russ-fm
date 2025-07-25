import { 
  AuthStatus, 
  AuthResponse, 
  ScrobbleRequest, 
  AlbumScrobbleRequest, 
  AlbumScrobbleResponse 
} from '../types/scrobble';

class ScrobbleApiService {
  private baseUrl: string;

  constructor() {
    // In development, use production API; in production, use relative URLs
    this.baseUrl = import.meta.env.DEV ? 'https://russ.fm' : '';
  }

  async getAuthStatus(): Promise<AuthStatus> {
    // Check if we have a session token (for cross-domain scenarios)
    const sessionToken = localStorage.getItem('lastfm_session_token');
    
    if (sessionToken) {
      // Use token exchange endpoint
      const response = await fetch(`${this.baseUrl}/api/auth/exchange?session=${encodeURIComponent(sessionToken)}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        // Token might be invalid, remove it and fall back to cookie-based auth
        localStorage.removeItem('lastfm_session_token');
        throw new Error('Failed to exchange session token');
      }
      
      return response.json();
    } else {
      // Use cookie-based auth
      const response = await fetch(`${this.baseUrl}/api/auth/status`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to get auth status');
      }
      
      return response.json();
    }
  }

  async login(): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to initiate login');
    }
    
    return response.json();
  }

  async logout(): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to logout');
    }
    
    return response.json();
  }

  async refreshArtwork(): Promise<{ success: boolean; lastAlbumArt: string | null }> {
    const response = await fetch(`${this.baseUrl}/api/auth/refresh-artwork`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh artwork');
    }
    
    return response.json();
  }

  async scrobbleTrack(request: ScrobbleRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await fetch(`${this.baseUrl}/api/scrobble/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(request)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to scrobble track');
    }
    
    return data;
  }

  async scrobbleAlbum(request: AlbumScrobbleRequest): Promise<AlbumScrobbleResponse> {
    const response = await fetch(`${this.baseUrl}/api/scrobble/album`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(request)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to scrobble album');
    }
    
    return data;
  }
}

export const scrobbleApi = new ScrobbleApiService();