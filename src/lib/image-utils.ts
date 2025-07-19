import { appConfig } from '@/config/app.config';
import type { ImageSize } from '@/types/assets';

/**
 * Get the appropriate image URL based on environment
 * - Development: serves from local /public/ directory
 * - Production: serves from R2 CDN
 */
export function getImageUrl(relativePath: string): string {
  if (!appConfig.assets.useR2) {
    // Development: use local images from /public/
    return `/${relativePath}`;
  }
  // Production: use R2 CDN
  return `${appConfig.assets.baseUrl}/${relativePath}`;
}

/**
 * Get album image URL for a specific size
 */
export function getAlbumImageUrl(albumSlug: string, size: ImageSize = 'medium'): string {
  const imagePath = `album/${albumSlug}/${albumSlug}-${size}.jpg`;
  return getImageUrl(imagePath);
}

/**
 * Get artist image URL for a specific size
 */
export function getArtistImageUrl(artistSlug: string, size: ImageSize = 'medium'): string {
  const imagePath = `artist/${artistSlug}/${artistSlug}-${size}.jpg`;
  return getImageUrl(imagePath);
}

/**
 * Get artist avatar URL (always small size)
 */
export function getArtistAvatarUrl(artistSlug: string): string {
  const imagePath = `artist/${artistSlug}/${artistSlug}-avatar.jpg`;
  return getImageUrl(imagePath);
}

/**
 * Generate responsive srcSet for album images
 */
export function getAlbumImageSrcSet(albumSlug: string): string {
  return [
    `${getAlbumImageUrl(albumSlug, 'small')} 400w`,
    `${getAlbumImageUrl(albumSlug, 'medium')} 800w`,
    `${getAlbumImageUrl(albumSlug, 'hi-res')} 1400w`
  ].join(', ');
}

/**
 * Generate responsive srcSet for artist images
 */
export function getArtistImageSrcSet(artistSlug: string): string {
  return [
    `${getArtistImageUrl(artistSlug, 'small')} 400w`,
    `${getArtistImageUrl(artistSlug, 'medium')} 800w`,
    `${getArtistImageUrl(artistSlug, 'hi-res')} 1400w`
  ].join(', ');
}

/**
 * Handle image loading errors with fallback
 */
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement>): void {
  const img = event.currentTarget;
  if (!img.dataset.fallbackAttempted) {
    img.dataset.fallbackAttempted = 'true';
    img.src = appConfig.assets.fallbackUrl;
  }
}

/**
 * Extract album slug from uri_release
 */
export function getAlbumSlug(uriRelease: string): string {
  return uriRelease.replace('/album/', '').replace('/', '');
}

/**
 * Extract artist slug from uri_artist
 */
export function getArtistSlug(uriArtist: string): string {
  return uriArtist.replace('/artist/', '').replace('/', '');
}

/**
 * Get album image URL from album data
 */
export function getAlbumImageFromData(uriRelease: string, size: ImageSize = 'medium'): string {
  const slug = getAlbumSlug(uriRelease);
  return getAlbumImageUrl(slug, size);
}

/**
 * Get artist image URL from artist data
 */
export function getArtistImageFromData(uriArtist: string, size: ImageSize = 'medium'): string {
  const slug = getArtistSlug(uriArtist);
  return getArtistImageUrl(slug, size);
}

/**
 * Get artist avatar URL from artist data
 */
export function getArtistAvatarFromData(uriArtist: string): string {
  const slug = getArtistSlug(uriArtist);
  return getArtistAvatarUrl(slug);
}

/**
 * Convert existing image URI to new format
 * This helps migrate from the current `album.images_uri_release.medium` format
 */
export function migrateImageUri(currentUri: string): string {
  // If it's already a full URL (R2), return as-is
  if (currentUri.startsWith('http')) {
    return currentUri;
  }
  
  // Convert local path to use our new utility
  return getImageUrl(currentUri.startsWith('/') ? currentUri.slice(1) : currentUri);
}