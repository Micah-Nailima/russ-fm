import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MusicPlayerPreferences,
  PreferenceUpdateOptions,
  getPreferences,
  updatePreferences,
  resetPreferences,
  isStorageAvailable,
  DEFAULT_PREFERENCES
} from '@/lib/musicPlayerPreferences';

export interface UseMusicPlayerPreferencesReturn {
  preferences: MusicPlayerPreferences;
  updatePreference: (updates: PreferenceUpdateOptions) => void;
  togglePlayers: () => void;
  setPreferredService: (service: 'spotify' | 'apple_music' | undefined) => void;
  toggleAutoplay: () => void;
  setVolume: (volume: number) => void;
  resetToDefaults: () => void;
  isStorageAvailable: boolean;
}

/**
 * Custom hook for managing music player preferences
 * Provides reactive state management with localStorage persistence
 */
export function useMusicPlayerPreferences(): UseMusicPlayerPreferencesReturn {
  const storageAvailable = useMemo(() => isStorageAvailable(), []);
  
  // Initialize state with stored preferences or defaults
  const [preferences, setPreferences] = useState<MusicPlayerPreferences>(() => {
    return storageAvailable ? getPreferences() : DEFAULT_PREFERENCES;
  });

  // Sync with localStorage changes from other tabs/windows
  useEffect(() => {
    if (!storageAvailable) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'musicPlayerPreferences' && e.newValue) {
        try {
          const newPrefs = JSON.parse(e.newValue);
          setPreferences(newPrefs);
        } catch (error) {
          console.error('Error parsing storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [storageAvailable]);

  // Update preferences with automatic persistence
  const updatePreference = useCallback((updates: PreferenceUpdateOptions) => {
    const newPrefs = updatePreferences(updates);
    setPreferences(newPrefs);
  }, []);

  // Toggle players visibility
  const togglePlayers = useCallback(() => {
    updatePreference({ showPlayers: !preferences.showPlayers });
  }, [preferences.showPlayers, updatePreference]);

  // Set preferred service
  const setPreferredService = useCallback((service: 'spotify' | 'apple_music' | undefined) => {
    updatePreference({ preferredService: service });
  }, [updatePreference]);

  // Toggle autoplay
  const toggleAutoplay = useCallback(() => {
    updatePreference({ autoplay: !preferences.autoplay });
  }, [preferences.autoplay, updatePreference]);

  // Set volume (0-1)
  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    updatePreference({ volume: clampedVolume });
  }, [updatePreference]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    const defaults = resetPreferences();
    setPreferences(defaults);
  }, []);

  return {
    preferences,
    updatePreference,
    togglePlayers,
    setPreferredService,
    toggleAutoplay,
    setVolume,
    resetToDefaults,
    isStorageAvailable: storageAvailable
  };
}

/**
 * Hook for accessing only the player visibility state
 * Useful for components that only need to know if players should be shown
 */
export function usePlayerVisibility(): [boolean, () => void] {
  const { preferences, togglePlayers } = useMusicPlayerPreferences();
  return [preferences.showPlayers, togglePlayers];
}

/**
 * Hook for accessing preferred service
 * Useful for components that need to prioritize one service over another
 */
export function usePreferredService(): ['spotify' | 'apple_music' | undefined, (service: 'spotify' | 'apple_music' | undefined) => void] {
  const { preferences, setPreferredService } = useMusicPlayerPreferences();
  return [preferences.preferredService, setPreferredService];
}