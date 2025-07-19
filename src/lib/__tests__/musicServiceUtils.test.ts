import { describe, it, expect } from 'vitest';
import {
  isValidSpotifyUrl,
  isValidAppleMusicUrl,
  parseSpotifyUrl,
  parseAppleMusicUrl,
  extractSpotifyAlbumId,
  extractAppleMusicAlbumId,
  buildSpotifyEmbedUrl,
  buildAppleMusicEmbedUrl,
  validateAndNormalizeUrl,
  MusicServiceError
} from '../musicServiceUtils';

describe('musicServiceUtils', () => {
  describe('isValidSpotifyUrl', () => {
    it('should validate correct Spotify URLs', () => {
      expect(isValidSpotifyUrl('https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy')).toBe(true);
      expect(isValidSpotifyUrl('https://spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy')).toBe(true);
      expect(isValidSpotifyUrl('https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy?si=abc123')).toBe(true);
      expect(isValidSpotifyUrl('http://open.spotify.com/track/1234567890123456789012')).toBe(true);
      expect(isValidSpotifyUrl('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M')).toBe(true);
      expect(isValidSpotifyUrl('https://open.spotify.com/artist/4Z8W4fKeB5YxbusRsdQVPb')).toBe(true);
    });

    it('should reject invalid Spotify URLs', () => {
      expect(isValidSpotifyUrl('')).toBe(false);
      expect(isValidSpotifyUrl('not-a-url')).toBe(false);
      expect(isValidSpotifyUrl('https://music.apple.com/us/album/test/123')).toBe(false);
      expect(isValidSpotifyUrl('https://open.spotify.com/invalid/123')).toBe(false);
      expect(isValidSpotifyUrl('https://open.spotify.com/album/')).toBe(false);
      expect(isValidSpotifyUrl('https://open.spotify.com/album/invalid-id')).toBe(false);
      expect(isValidSpotifyUrl(null as unknown as string)).toBe(false);
      expect(isValidSpotifyUrl(undefined as unknown as string)).toBe(false);
    });
  });

  describe('isValidAppleMusicUrl', () => {
    it('should validate correct Apple Music URLs', () => {
      expect(isValidAppleMusicUrl('https://music.apple.com/us/album/test-album/1234567890')).toBe(true);
      expect(isValidAppleMusicUrl('https://music.apple.com/gb/album/another-album/9876543210')).toBe(true);
      expect(isValidAppleMusicUrl('https://music.apple.com/us/song/test-song/1234567890')).toBe(true);
      expect(isValidAppleMusicUrl('https://music.apple.com/us/album/test-album/1234567890?i=1111111111')).toBe(true);
      expect(isValidAppleMusicUrl('http://music.apple.com/fr/artist/test-artist/1234567890')).toBe(true);
    });

    it('should reject invalid Apple Music URLs', () => {
      expect(isValidAppleMusicUrl('')).toBe(false);
      expect(isValidAppleMusicUrl('not-a-url')).toBe(false);
      expect(isValidAppleMusicUrl('https://open.spotify.com/album/123')).toBe(false);
      expect(isValidAppleMusicUrl('https://music.apple.com/album/test/123')).toBe(false); // missing country
      expect(isValidAppleMusicUrl('https://music.apple.com/us/album/')).toBe(false); // missing name and id
      expect(isValidAppleMusicUrl('https://music.apple.com/us/album/test/')).toBe(false); // missing id
      expect(isValidAppleMusicUrl('https://music.apple.com/us/album/test/abc')).toBe(false); // non-numeric id
      expect(isValidAppleMusicUrl('https://music.apple.com/USA/album/test/123')).toBe(false); // invalid country code
      expect(isValidAppleMusicUrl(null as unknown as string)).toBe(false);
      expect(isValidAppleMusicUrl(undefined as unknown as string)).toBe(false);
    });
  });

  describe('parseSpotifyUrl', () => {
    it('should parse valid Spotify album URLs', () => {
      const result = parseSpotifyUrl('https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy');
      expect(result).toEqual({
        type: 'album',
        id: '4aawyAB9vmqN3uQ7FjRGTy',
        originalUrl: 'https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy'
      });
    });

    it('should parse Spotify URLs with query parameters', () => {
      const result = parseSpotifyUrl('https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy?si=abc123');
      expect(result).toEqual({
        type: 'album',
        id: '4aawyAB9vmqN3uQ7FjRGTy',
        originalUrl: 'https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy?si=abc123'
      });
    });

    it('should parse different Spotify content types', () => {
      const trackResult = parseSpotifyUrl('https://open.spotify.com/track/1234567890123456789012');
      expect(trackResult.type).toBe('track');
      expect(trackResult.id).toBe('1234567890123456789012');

      const playlistResult = parseSpotifyUrl('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M');
      expect(playlistResult.type).toBe('playlist');
      expect(playlistResult.id).toBe('37i9dQZF1DXcBWIGoYBM5M');
    });

    it('should handle whitespace in URLs', () => {
      const result = parseSpotifyUrl('  https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy  ');
      expect(result.id).toBe('4aawyAB9vmqN3uQ7FjRGTy');
    });

    it('should throw MusicServiceError for invalid URLs', () => {
      expect(() => parseSpotifyUrl('')).toThrow(MusicServiceError);
      expect(() => parseSpotifyUrl('invalid-url')).toThrow(MusicServiceError);
      expect(() => parseSpotifyUrl('https://music.apple.com/us/album/test/123')).toThrow(MusicServiceError);
      expect(() => parseSpotifyUrl('https://open.spotify.com/album/invalid-id')).toThrow(MusicServiceError);
      expect(() => parseSpotifyUrl(null as unknown as string)).toThrow(MusicServiceError);
      
      // Test error properties
      try {
        parseSpotifyUrl('invalid-url');
      } catch (error) {
        expect(error).toBeInstanceOf(MusicServiceError);
        expect((error as MusicServiceError).service).toBe('spotify');
        expect((error as MusicServiceError).originalUrl).toBe('invalid-url');
      }
    });
  });

  describe('parseAppleMusicUrl', () => {
    it('should parse valid Apple Music album URLs', () => {
      const result = parseAppleMusicUrl('https://music.apple.com/us/album/test-album/1234567890');
      expect(result).toEqual({
        type: 'album',
        id: '1234567890',
        country: 'us',
        name: 'test album',
        originalUrl: 'https://music.apple.com/us/album/test-album/1234567890'
      });
    });

    it('should parse Apple Music URLs with query parameters', () => {
      const result = parseAppleMusicUrl('https://music.apple.com/us/album/test-album/1234567890?i=1111111111');
      expect(result.id).toBe('1234567890');
      expect(result.country).toBe('us');
    });

    it('should parse different Apple Music content types', () => {
      const songResult = parseAppleMusicUrl('https://music.apple.com/gb/song/test-song/9876543210');
      expect(songResult.type).toBe('song');
      expect(songResult.country).toBe('gb');
      expect(songResult.id).toBe('9876543210');

      const artistResult = parseAppleMusicUrl('https://music.apple.com/fr/artist/test-artist/1111111111');
      expect(artistResult.type).toBe('artist');
      expect(artistResult.country).toBe('fr');
    });

    it('should decode album names with hyphens', () => {
      const result = parseAppleMusicUrl('https://music.apple.com/us/album/my-great-album-name/1234567890');
      expect(result.name).toBe('my great album name');
    });

    it('should handle whitespace in URLs', () => {
      const result = parseAppleMusicUrl('  https://music.apple.com/us/album/test-album/1234567890  ');
      expect(result.id).toBe('1234567890');
    });

    it('should throw MusicServiceError for invalid URLs', () => {
      expect(() => parseAppleMusicUrl('')).toThrow(MusicServiceError);
      expect(() => parseAppleMusicUrl('invalid-url')).toThrow(MusicServiceError);
      expect(() => parseAppleMusicUrl('https://open.spotify.com/album/123')).toThrow(MusicServiceError);
      expect(() => parseAppleMusicUrl('https://music.apple.com/us/album/test/abc')).toThrow(MusicServiceError);
      expect(() => parseAppleMusicUrl('https://music.apple.com/USA/album/test/123')).toThrow(MusicServiceError);
      expect(() => parseAppleMusicUrl(null as unknown as string)).toThrow(MusicServiceError);

      // Test error properties
      try {
        parseAppleMusicUrl('invalid-url');
      } catch (error) {
        expect(error).toBeInstanceOf(MusicServiceError);
        expect((error as MusicServiceError).service).toBe('apple_music');
        expect((error as MusicServiceError).originalUrl).toBe('invalid-url');
      }
    });
  });

  describe('extractSpotifyAlbumId', () => {
    it('should extract ID from valid Spotify album URLs', () => {
      expect(extractSpotifyAlbumId('https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy')).toBe('4aawyAB9vmqN3uQ7FjRGTy');
      expect(extractSpotifyAlbumId('https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy?si=abc')).toBe('4aawyAB9vmqN3uQ7FjRGTy');
    });

    it('should return ID if input is already a valid Spotify ID', () => {
      expect(extractSpotifyAlbumId('4aawyAB9vmqN3uQ7FjRGTy')).toBe('4aawyAB9vmqN3uQ7FjRGTy');
    });

    it('should handle whitespace', () => {
      expect(extractSpotifyAlbumId('  4aawyAB9vmqN3uQ7FjRGTy  ')).toBe('4aawyAB9vmqN3uQ7FjRGTy');
      expect(extractSpotifyAlbumId('  https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy  ')).toBe('4aawyAB9vmqN3uQ7FjRGTy');
    });

    it('should throw error for non-album URLs', () => {
      expect(() => extractSpotifyAlbumId('https://open.spotify.com/track/4aawyAB9vmqN3uQ7FjRGTy')).toThrow(MusicServiceError);
      expect(() => extractSpotifyAlbumId('https://open.spotify.com/playlist/4aawyAB9vmqN3uQ7FjRGTy')).toThrow(MusicServiceError);
    });

    it('should throw error for invalid inputs', () => {
      expect(() => extractSpotifyAlbumId('')).toThrow(MusicServiceError);
      expect(() => extractSpotifyAlbumId('invalid-id')).toThrow(MusicServiceError);
      expect(() => extractSpotifyAlbumId('https://music.apple.com/us/album/test/123')).toThrow(MusicServiceError);
      expect(() => extractSpotifyAlbumId(null as unknown as string)).toThrow(MusicServiceError);
    });
  });

  describe('extractAppleMusicAlbumId', () => {
    it('should extract ID from valid Apple Music album URLs', () => {
      expect(extractAppleMusicAlbumId('https://music.apple.com/us/album/test-album/1234567890')).toBe('1234567890');
      expect(extractAppleMusicAlbumId('https://music.apple.com/us/album/test-album/1234567890?i=111')).toBe('1234567890');
    });

    it('should return ID if input is already a valid Apple Music ID', () => {
      expect(extractAppleMusicAlbumId('1234567890')).toBe('1234567890');
    });

    it('should handle whitespace', () => {
      expect(extractAppleMusicAlbumId('  1234567890  ')).toBe('1234567890');
      expect(extractAppleMusicAlbumId('  https://music.apple.com/us/album/test/1234567890  ')).toBe('1234567890');
    });

    it('should throw error for non-album URLs', () => {
      expect(() => extractAppleMusicAlbumId('https://music.apple.com/us/song/test-song/1234567890')).toThrow(MusicServiceError);
      expect(() => extractAppleMusicAlbumId('https://music.apple.com/us/artist/test-artist/1234567890')).toThrow(MusicServiceError);
    });

    it('should throw error for invalid inputs', () => {
      expect(() => extractAppleMusicAlbumId('')).toThrow(MusicServiceError);
      expect(() => extractAppleMusicAlbumId('invalid-id')).toThrow(MusicServiceError);
      expect(() => extractAppleMusicAlbumId('https://open.spotify.com/album/123')).toThrow(MusicServiceError);
      expect(() => extractAppleMusicAlbumId(null as unknown as string)).toThrow(MusicServiceError);
    });
  });

  describe('buildSpotifyEmbedUrl', () => {
    it('should build basic embed URL', () => {
      const url = buildSpotifyEmbedUrl('4aawyAB9vmqN3uQ7FjRGTy');
      expect(url).toBe('https://open.spotify.com/embed/album/4aawyAB9vmqN3uQ7FjRGTy');
    });

    it('should build embed URL with options', () => {
      const url = buildSpotifyEmbedUrl('4aawyAB9vmqN3uQ7FjRGTy', {
        theme: 'dark',
        height: 380
      });
      expect(url).toBe('https://open.spotify.com/embed/album/4aawyAB9vmqN3uQ7FjRGTy?theme=dark&height=380');
    });

    it('should handle whitespace in album ID', () => {
      const url = buildSpotifyEmbedUrl('  4aawyAB9vmqN3uQ7FjRGTy  ');
      expect(url).toBe('https://open.spotify.com/embed/album/4aawyAB9vmqN3uQ7FjRGTy');
    });

    it('should throw error for invalid album IDs', () => {
      expect(() => buildSpotifyEmbedUrl('')).toThrow(MusicServiceError);
      expect(() => buildSpotifyEmbedUrl('invalid-id')).toThrow(MusicServiceError);
      expect(() => buildSpotifyEmbedUrl(null as unknown as string)).toThrow(MusicServiceError);
    });
  });

  describe('buildAppleMusicEmbedUrl', () => {
    it('should build basic embed URL', () => {
      const url = buildAppleMusicEmbedUrl('1234567890');
      expect(url).toBe('https://embed.music.apple.com/us/album/1234567890?app=music&itsct=music_box_player&itscg=30200&ls=1&theme=dark');
    });

    it('should build embed URL with custom country', () => {
      const url = buildAppleMusicEmbedUrl('1234567890', 'gb');
      expect(url).toBe('https://embed.music.apple.com/gb/album/1234567890?app=music&itsct=music_box_player&itscg=30200&ls=1&theme=dark');
    });

    it('should build embed URL with options', () => {
      const url = buildAppleMusicEmbedUrl('1234567890', 'us', { height: 450 });
      expect(url).toBe('https://embed.music.apple.com/us/album/1234567890?app=music&itsct=music_box_player&itscg=30200&ls=1&theme=dark&height=450');
    });

    it('should handle case insensitive country codes', () => {
      const url = buildAppleMusicEmbedUrl('1234567890', 'GB');
      expect(url).toBe('https://embed.music.apple.com/gb/album/1234567890?app=music&itsct=music_box_player&itscg=30200&ls=1&theme=dark');
    });

    it('should handle whitespace', () => {
      const url = buildAppleMusicEmbedUrl('  1234567890  ', '  us  ');
      expect(url).toBe('https://embed.music.apple.com/us/album/1234567890?app=music&itsct=music_box_player&itscg=30200&ls=1&theme=dark');
    });

    it('should throw error for invalid inputs', () => {
      expect(() => buildAppleMusicEmbedUrl('', 'us')).toThrow(MusicServiceError);
      expect(() => buildAppleMusicEmbedUrl('1234567890', '')).toThrow(MusicServiceError);
      expect(() => buildAppleMusicEmbedUrl('invalid-id', 'us')).toThrow(MusicServiceError);
      expect(() => buildAppleMusicEmbedUrl('1234567890', 'USA')).toThrow(MusicServiceError);
      expect(() => buildAppleMusicEmbedUrl(null as unknown as string, 'us')).toThrow(MusicServiceError);
      expect(() => buildAppleMusicEmbedUrl('1234567890', null as unknown as string)).toThrow(MusicServiceError);
    });
  });

  describe('validateAndNormalizeUrl', () => {
    it('should normalize Spotify URLs', () => {
      const url = validateAndNormalizeUrl('https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy?si=abc', 'spotify');
      expect(url).toBe('https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy');
    });

    it('should normalize Apple Music URLs', () => {
      const url = validateAndNormalizeUrl('https://music.apple.com/us/album/my-great-album/1234567890?i=111', 'apple_music');
      expect(url).toBe('https://music.apple.com/us/album/my-great-album/1234567890');
    });

    it('should handle whitespace', () => {
      const url = validateAndNormalizeUrl('  https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy  ', 'spotify');
      expect(url).toBe('https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy');
    });

    it('should throw error for invalid URLs', () => {
      expect(() => validateAndNormalizeUrl('', 'spotify')).toThrow(MusicServiceError);
      expect(() => validateAndNormalizeUrl('invalid-url', 'spotify')).toThrow(MusicServiceError);
      expect(() => validateAndNormalizeUrl('https://music.apple.com/us/album/test/123', 'spotify')).toThrow(MusicServiceError);
      expect(() => validateAndNormalizeUrl('https://open.spotify.com/album/123', 'apple_music')).toThrow(MusicServiceError);
      expect(() => validateAndNormalizeUrl('valid-url', 'unsupported' as 'spotify' | 'apple_music')).toThrow(MusicServiceError);
      expect(() => validateAndNormalizeUrl(null as unknown as string, 'spotify')).toThrow(MusicServiceError);
    });
  });

  describe('MusicServiceError', () => {
    it('should create error with correct properties', () => {
      const error = new MusicServiceError('Test message', 'spotify', 'test-url');
      expect(error.message).toBe('Test message');
      expect(error.service).toBe('spotify');
      expect(error.originalUrl).toBe('test-url');
      expect(error.name).toBe('MusicServiceError');
      expect(error).toBeInstanceOf(Error);
    });

    it('should work without originalUrl', () => {
      const error = new MusicServiceError('Test message', 'apple_music');
      expect(error.message).toBe('Test message');
      expect(error.service).toBe('apple_music');
      expect(error.originalUrl).toBeUndefined();
    });
  });
});