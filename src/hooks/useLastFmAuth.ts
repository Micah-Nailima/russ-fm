import { useState, useEffect } from 'react';
import { scrobbleApi } from '../services/scrobbleApi';
import { AuthStatus, LastFmUser } from '../types/scrobble';

export function useLastFmAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<LastFmUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const status: AuthStatus = await scrobbleApi.getAuthStatus();
      setIsAuthenticated(status.authenticated);
      setUser(status.user || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check auth status');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    try {
      setError(null);
      const response = await scrobbleApi.login();
      
      if (response.authUrl) {
        // Open Last.fm auth in a new window
        const authWindow = window.open(
          response.authUrl,
          'lastfm-auth',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        // Poll for auth completion
        const pollForAuth = () => {
          const checkAuth = async () => {
            try {
              const status = await scrobbleApi.getAuthStatus();
              if (status.authenticated) {
                setIsAuthenticated(true);
                setUser(status.user || null);
                authWindow?.close();
                return;
              }
            } catch (err) {
              // Continue polling
            }
            
            // Continue polling if window is still open
            if (authWindow && !authWindow.closed) {
              setTimeout(checkAuth, 2000);
            } else {
              // User closed the window
              checkAuthStatus();
            }
          };
          
          checkAuth();
        };

        pollForAuth();
      } else {
        throw new Error(response.error || 'Failed to get auth URL');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await scrobbleApi.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  };

  const refreshArtwork = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      const response = await scrobbleApi.refreshArtwork();
      if (response.success) {
        setUser({
          ...user,
          lastAlbumArt: response.lastAlbumArt
        });
      }
    } catch (err) {
      console.error('Failed to refresh artwork:', err);
    }
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    logout,
    refreshArtwork,
    checkAuthStatus
  };
}