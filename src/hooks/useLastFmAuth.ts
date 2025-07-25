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
        // Direct redirect to Last.fm (standard OAuth flow)
        window.location.href = response.authUrl;
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