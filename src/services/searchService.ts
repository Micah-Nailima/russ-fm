import Fuse from 'fuse.js';
import { getAlbumImageFromData, getArtistImageFromData } from '@/lib/image-utils';
import { filterGenres } from '@/lib/filterGenres';

export interface Album {
  release_name: string;
  release_artist: string;
  artists?: Array<{
    name: string;
    uri_artist: string;
    json_detailed_artist: string;
    images_uri_artist: {
      'hi-res': string;
      medium: string;
    };
  }>;
  genre_names: string[];
  uri_release: string;
  uri_artist: string;
  date_added: string;
  date_release_year: string;
  images_uri_release: {
    'hi-res': string;
    medium: string;
  };
  images_uri_artist: {
    'hi-res': string;
    medium: string;
  };
}

export interface SearchResult {
  type: 'album' | 'artist';
  id: string;
  title: string;
  subtitle: string;
  image: string;
  url: string;
  year?: string;
  genres?: string[];
  albumCount?: number;
  score?: number; // Fuse.js match score
  matches?: Fuse.FuseResultMatch[]; // Fuse.js match details
}

export interface SearchOptions {
  limit?: number;
  threshold?: number;
  includeMatches?: boolean;
  sortByScore?: boolean;
  filterByType?: 'album' | 'artist';
}

interface FuseSearchResult extends Fuse.FuseResult<Album> {
  item: Album;
}

class FuseSearchService {
  private albumFuse: Fuse<Album> | null = null;
  private collection: Album[] = [];
  private isInitialized = false;
  private isMobile = false;

  constructor() {
    this.detectMobile();
    window.addEventListener('resize', this.detectMobile.bind(this));
  }

  private detectMobile() {
    this.isMobile = window.innerWidth < 768;
  }

  private getMobileConfig(): Fuse.IFuseOptions<Album> {
    return {
      keys: [
        { name: 'release_name', weight: 0.5 },
        { name: 'release_artist', weight: 0.3 },
        { name: 'genre_names', weight: 0.2 }
      ],
      threshold: 0.4, // More lenient for touch typing
      location: 0,
      distance: 100,
      includeScore: true,
      includeMatches: false, // Disable for mobile performance
      minMatchCharLength: 2,
      shouldSort: true,
      findAllMatches: false,
      ignoreLocation: false,
      useExtendedSearch: false // Simpler search for mobile
    };
  }

  private getDesktopConfig(): Fuse.IFuseOptions<Album> {
    return {
      keys: [
        { name: 'release_name', weight: 0.35 },
        { name: 'release_artist', weight: 0.25 },
        { name: 'artists.name', weight: 0.20 },
        { name: 'genre_names', weight: 0.15 },
        { name: 'date_release_year', weight: 0.05 }
      ],
      threshold: 0.3, // Stricter for keyboard typing
      location: 0,
      distance: 100,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      shouldSort: true,
      findAllMatches: false,
      ignoreLocation: false,
      useExtendedSearch: true // Enable advanced search operators
    };
  }

  async initialize(collection: Album[]): Promise<void> {
    try {
      this.collection = collection;
      const config = this.isMobile ? this.getMobileConfig() : this.getDesktopConfig();
      
      // Use requestIdleCallback for non-blocking indexing
      if ('requestIdleCallback' in window) {
        await new Promise<void>((resolve) => {
          window.requestIdleCallback(() => {
            this.albumFuse = new Fuse(collection, config);
            this.isInitialized = true;
            resolve();
          });
        });
      } else {
        // Fallback for browsers without requestIdleCallback
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            this.albumFuse = new Fuse(collection, config);
            this.isInitialized = true;
            resolve();
          }, 0);
        });
      }
    } catch (error) {
      console.error('Failed to initialize search service:', error);
      throw new Error('Search initialization failed');
    }
  }

  search(query: string, options: SearchOptions = {}): SearchResult[] {
    if (!this.isInitialized || !this.albumFuse || !query.trim()) {
      return [];
    }

    const {
      limit = this.isMobile ? 20 : 50,
      threshold,
      includeMatches = false,
      sortByScore = true,
      filterByType
    } = options;

    try {
      // Update Fuse options if needed
      if (threshold !== undefined) {
        this.albumFuse.setCollection(this.collection, {
          ...this.albumFuse.options,
          threshold,
          includeMatches
        });
      }

      // Perform search
      const fuseResults = this.albumFuse.search(query, { limit: limit * 2 }); // Get more results for processing

      // Process results
      const albumResults: SearchResult[] = [];
      const artistResults: Map<string, SearchResult> = new Map();

      fuseResults.forEach((result: FuseSearchResult) => {
        const album = result.item;
        
        // Create album result
        const albumResult: SearchResult = {
          type: 'album',
          id: album.uri_release,
          title: album.release_name,
          subtitle: album.artists && album.artists.length > 1 
            ? album.artists.map(artist => artist.name).join(' & ')
            : album.release_artist,
          image: getAlbumImageFromData(album.uri_release, 'medium'),
          url: album.uri_release,
          year: new Date(album.date_release_year).getFullYear().toString(),
          genres: filterGenres(album.genre_names, album.release_artist).slice(0, 3),
          score: result.score,
          matches: includeMatches ? result.matches : undefined
        };

        // Always add albums to album results (unless specifically filtered out)
        if (!filterByType || filterByType === 'album') {
          albumResults.push(albumResult);
        }

        // Process artists for artist results (unless specifically filtered out)
        if (!filterByType || filterByType === 'artist') {
          this.processArtistResults(album, artistResults, result.score);
        }
      });

      // Debug logging
      console.log('Search results breakdown:', {
        query,
        fuseResultsCount: fuseResults.length,
        albumResultsCount: albumResults.length,
        artistResultsCount: artistResults.size,
        filterByType
      });

      // Combine and sort results
      let combinedResults: SearchResult[] = [];
      
      if (!filterByType) {
        // Interleave artists and albums for better UX
        const sortedArtists = Array.from(artistResults.values())
          .sort((a, b) => sortByScore ? (a.score || 0) - (b.score || 0) : a.title.localeCompare(b.title));
        
        const sortedAlbums = albumResults
          .sort((a, b) => sortByScore ? (a.score || 0) - (b.score || 0) : a.title.localeCompare(b.title));

        // Instead of artists first, let's mix them based on relevance score
        const allResults = [...sortedArtists, ...sortedAlbums];
        combinedResults = allResults.sort((a, b) => {
          if (sortByScore && a.score !== undefined && b.score !== undefined) {
            return a.score - b.score; // Lower score = better match in Fuse.js
          }
          return a.title.localeCompare(b.title);
        });
      } else if (filterByType === 'artist') {
        combinedResults = Array.from(artistResults.values())
          .sort((a, b) => sortByScore ? (a.score || 0) - (b.score || 0) : a.title.localeCompare(b.title));
      } else {
        combinedResults = albumResults
          .sort((a, b) => sortByScore ? (a.score || 0) - (b.score || 0) : a.title.localeCompare(b.title));
      }
      
      console.log('Final combined results:', combinedResults.slice(0, 5));

      return combinedResults.slice(0, limit);
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }

  private processArtistResults(album: Album, artistResults: Map<string, SearchResult>, score?: number) {
    if (album.artists && album.artists.length > 0) {
      album.artists.forEach(artist => {
        if (artist.name.toLowerCase() === 'various') return;
        
        const artistKey = artist.name.toLowerCase();
        if (artistResults.has(artistKey)) {
          const existing = artistResults.get(artistKey)!;
          existing.albumCount = (existing.albumCount || 0) + 1;
          // Keep the best score
          if (score !== undefined && (existing.score === undefined || score < existing.score)) {
            existing.score = score;
          }
        } else {
          artistResults.set(artistKey, {
            type: 'artist',
            id: artist.uri_artist,
            title: artist.name,
            subtitle: 'Artist in collection',
            image: getArtistImageFromData(artist.uri_artist, 'medium'),
            url: artist.uri_artist,
            albumCount: 1,
            score
          });
        }
      });
    } else {
      // Handle albums without artists array (backward compatibility)
      if (album.release_artist.toLowerCase() === 'various') return;
      
      const artistKey = album.release_artist.toLowerCase();
      if (artistResults.has(artistKey)) {
        const existing = artistResults.get(artistKey)!;
        existing.albumCount = (existing.albumCount || 0) + 1;
        if (score !== undefined && (existing.score === undefined || score < existing.score)) {
          existing.score = score;
        }
      } else {
        artistResults.set(artistKey, {
          type: 'artist',
          id: album.uri_artist,
          title: album.release_artist,
          subtitle: 'Artist in collection',
          image: getArtistImageFromData(album.uri_artist, 'medium'),
          url: album.uri_artist,
          albumCount: 1,
          score
        });
      }
    }
  }


  updateIndex(collection: Album[]): void {
    if (this.isInitialized) {
      this.collection = collection;
      const config = this.isMobile ? this.getMobileConfig() : this.getDesktopConfig();
      this.albumFuse?.setCollection(collection, config);
    }
  }

  isReady(): boolean {
    return this.isInitialized && this.albumFuse !== null;
  }

  getStats() {
    return {
      isInitialized: this.isInitialized,
      collectionSize: this.collection.length,
      isMobile: this.isMobile,
      fuseOptions: this.albumFuse?.options
    };
  }

  destroy(): void {
    this.albumFuse = null;
    this.collection = [];
    this.isInitialized = false;
    window.removeEventListener('resize', this.detectMobile.bind(this));
  }
}

// Singleton instance
export const searchService = new FuseSearchService();

// Export the class for testing
export { FuseSearchService };