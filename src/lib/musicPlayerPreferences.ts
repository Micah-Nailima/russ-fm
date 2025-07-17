/**
 * Music player preferences management utilities
 * Handles user preferences for embedded music players with localStorage persistence
 */

export interface MusicPlayerPreferences {
  showPlayers: boolean;
  preferredService?: 'spotify' | 'apple_music';
  autoplay: boolean;
  volume: number;
  lastUpdated: string;
}

export interface PreferenceUpdateOptions {
  showPlayers?: boolean;
  preferredService?: 'spotify' | 'apple_music';
  autoplay?: boolean;
  volume?: number;
}

const STORAGE_KEY = 'musicPlayerPreferences';
const CURRENT_VERSION = '1.0.0';

/**
 * Default preferences for music players
 */
export const DEFAULT_PREFERENCES: MusicPlayerPreferences = {
  showPlayers: true,
  preferredService: 'apple_music',
  autoplay: false,
  volume: 0.7,
  lastUpdated: new Date().toISOString()
};

/**
 * Validates preference object structure
 */
function isValidPreferences(data: unknown): data is MusicPlayerPreferences {
  if (!data || typeof data !== 'object') return false;
  
  const prefs = data as Record<string, unknown>;
  
  return (
    typeof prefs.showPlayers === 'boolean' &&
    (prefs.preferredService === undefined || 
     prefs.preferredService === 'spotify' || 
     prefs.preferredService === 'apple_music') &&
    typeof prefs.autoplay === 'boolean' &&
    typeof prefs.volume === 'number' &&
    prefs.volume >= 0 &&
    prefs.volume <= 1 &&
    typeof prefs.lastUpdated === 'string'
  );
}

/**
 * Retrieves music player preferences from localStorage
 * Returns default preferences if none exist or data is invalid
 */
export function getPreferences(): MusicPlayerPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    
    const parsed = JSON.parse(stored);
    
    // Validate and migrate if necessary
    if (isValidPreferences(parsed)) {
      return parsed;
    }
    
    // If invalid, return defaults
    console.warn('Invalid preferences found in localStorage, using defaults');
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error('Error reading music player preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Saves music player preferences to localStorage
 */
export function savePreferences(preferences: MusicPlayerPreferences): boolean {
  try {
    const toSave: MusicPlayerPreferences = {
      ...preferences,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    return true;
  } catch (error) {
    console.error('Error saving music player preferences:', error);
    return false;
  }
}

/**
 * Updates specific preference values while preserving others
 */
export function updatePreferences(updates: PreferenceUpdateOptions): MusicPlayerPreferences {
  const current = getPreferences();
  const updated: MusicPlayerPreferences = {
    ...current,
    ...updates,
    lastUpdated: new Date().toISOString()
  };
  
  // Validate volume bounds
  if (updated.volume < 0) updated.volume = 0;
  if (updated.volume > 1) updated.volume = 1;
  
  savePreferences(updated);
  return updated;
}

/**
 * Resets preferences to defaults
 */
export function resetPreferences(): MusicPlayerPreferences {
  savePreferences(DEFAULT_PREFERENCES);
  return DEFAULT_PREFERENCES;
}

/**
 * Clears all stored preferences
 */
export function clearPreferences(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing music player preferences:', error);
  }
}

/**
 * Checks if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__musicPlayerPrefs_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates a preferences object with partial updates
 */
export function createPreferences(
  overrides: Partial<MusicPlayerPreferences> = {}
): MusicPlayerPreferences {
  return {
    ...DEFAULT_PREFERENCES,
    ...overrides,
    lastUpdated: overrides.lastUpdated || new Date().toISOString()
  };
}

/**
 * Exports preferences as JSON string for backup/sharing
 */
export function exportPreferences(): string {
  const preferences = getPreferences();
  return JSON.stringify({
    version: CURRENT_VERSION,
    preferences,
    exportedAt: new Date().toISOString()
  }, null, 2);
}

/**
 * Imports preferences from JSON string
 */
export function importPreferences(jsonString: string): MusicPlayerPreferences | null {
  try {
    const parsed = JSON.parse(jsonString);
    
    if (!parsed.preferences || !isValidPreferences(parsed.preferences)) {
      console.error('Invalid preferences format in import');
      return null;
    }
    
    savePreferences(parsed.preferences);
    return parsed.preferences;
  } catch (error) {
    console.error('Error importing preferences:', error);
    return null;
  }
}