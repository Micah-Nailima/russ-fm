import { useState } from 'react';
import { scrobbleApi } from '../services/scrobbleApi';
import { ScrobbleRequest, AlbumScrobbleRequest, AlbumScrobbleResponse } from '../types/scrobble';

export function useScrobble() {
  const [isScrobbling, setIsScrobbling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrobbleTrack = async (request: ScrobbleRequest) => {
    try {
      setIsScrobbling(true);
      setError(null);
      
      const response = await scrobbleApi.scrobbleTrack(request);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scrobble track';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsScrobbling(false);
    }
  };

  const scrobbleAlbum = async (request: AlbumScrobbleRequest): Promise<AlbumScrobbleResponse> => {
    try {
      setIsScrobbling(true);
      setError(null);
      
      const response = await scrobbleApi.scrobbleAlbum(request);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scrobble album';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsScrobbling(false);
    }
  };

  const clearError = () => setError(null);

  return {
    scrobbleTrack,
    scrobbleAlbum,
    isScrobbling,
    error,
    clearError
  };
}