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
    this.baseUrl = '';
  }

  async getAuthStatus(): Promise<AuthStatus> {
    const response = await fetch('/api/auth/status', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to get auth status');
    }
    
    return response.json();
  }

  async login(): Promise<AuthResponse> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to initiate login');
    }
    
    return response.json();
  }

  async logout(): Promise<AuthResponse> {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to logout');
    }
    
    return response.json();
  }

  async refreshArtwork(): Promise<{ success: boolean; lastAlbumArt: string | null }> {
    const response = await fetch('/api/auth/refresh-artwork', {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh artwork');
    }
    
    return response.json();
  }

  async scrobbleTrack(request: ScrobbleRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await fetch('/api/scrobble/track', {
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
    const response = await fetch('/api/scrobble/album', {
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