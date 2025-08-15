import { useState, useEffect } from 'react';
import { appConfig } from '@/config/app.config';
import type { ColorPalette } from '@/lib/colorExtractor';
import { getArtistImageFromData, getAlbumImageFromData } from '@/lib/image-utils';
import type { Album, Artist } from '@/types/album';

// Import section components
import { HeroSection } from '@/components/home/HeroSection';
import { RecentAlbumsSection } from '@/components/home/RecentAlbumsSection';
import { RecentArtistsSection } from '@/components/home/RecentArtistsSection';
import { GenresSection } from '@/components/home/GenresSection';
import { RandomCollectionSection } from '@/components/home/RandomCollectionSection';

export function HomePage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [recentAlbums, setRecentAlbums] = useState<Album[]>([]);
  const [recentArtists, setRecentArtists] = useState<Artist[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [randomizedGenreAlbums, setRandomizedGenreAlbums] = useState<Record<string, Album>>({});
  const [randomCollectionItems, setRandomCollectionItems] = useState<Album[]>([]);
  const [randomFeaturedIndex, setRandomFeaturedIndex] = useState(0);
  const [randomAutoRotateEnabled, setRandomAutoRotateEnabled] = useState(true);
  const [colorPalettes, setColorPalettes] = useState<Record<string, ColorPalette>>({});

  useEffect(() => {
    fetch('/collection.json')
      .then(res => res.json())
      .then((data: Album[]) => {
        setAlbums(data);
        
        // Get recent additions (configurable count + extra for hero rotation)
        const recentCount = Math.max(
          appConfig.homepage.recentlyAdded.displayCount,
          appConfig.homepage.hero.numberOfFeaturedAlbums
        ) + 6; // Get extra for variety
        const recent = [...data]
          .sort((a, b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime())
          .slice(0, recentCount);
        setRecentAlbums(recent);

        // Calculate genre counts and albums by decade for randomization
        const genreCounts = data.reduce((acc, album) => {
          album.genre_names.forEach(genre => {
            acc[genre] = (acc[genre] || 0) + 1;
          });
          return acc;
        }, {} as Record<string, number>);

        // Select random albums for the collection showcase
        const shuffledAlbums = [...data].sort(() => Math.random() - 0.5);
        const randomItems = shuffledAlbums.slice(0, appConfig.homepage.randomCollection.displayCount);
        console.log('HomePage: Setting randomCollectionItems:', {
          totalAlbums: data.length,
          shuffledCount: shuffledAlbums.length,
          randomItems: randomItems,
          firstItem: randomItems[0]
        });

        // Get recently added artists (unique by artist name, sorted by most recent album)
        const artistMap = new Map<string, { album: Album; artist: any }>();
        
        // Sort all albums by date_added (most recent first) and build artist map
        [...data]
          .sort((a, b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime())
          .forEach(album => {
            album.artists.forEach(artist => {
              if (!artistMap.has(artist.name)) {
                artistMap.set(artist.name, { album, artist });
              }
            });
          });

        // Convert to array and take first 6 unique artists
        const recentArtistsList = Array.from(artistMap.entries())
          .slice(0, 6)
          .map(([_, { album, artist }]) => ({
            name: artist.name,
            uri: artist.uri_artist,
            avatar: artist.uri_artist ? getArtistImageFromData(artist.uri_artist, 'hi-res') : getAlbumImageFromData(album.uri_release, 'hi-res'),
            latestAlbum: album
          }));

        setRecentArtists(recentArtistsList);

        // Pre-randomize genre representative albums (only once on load)
        const genreAlbumMap: Record<string, Album> = {};

        // Randomize genre albums
        Object.entries(genreCounts).forEach(([genre]) => {
          const genreAlbums = data.filter(album => album.genre_names.includes(genre));
          if (genreAlbums.length > 0) {
            genreAlbumMap[genre] = genreAlbums[Math.floor(Math.random() * genreAlbums.length)];
          }
        });

        setRandomizedGenreAlbums(genreAlbumMap);
        setRandomCollectionItems(randomItems);
        setRandomFeaturedIndex(0); // Reset to first item
        
        // Load pre-generated colors for featured albums
        const loadColors = async () => {
          try {
            const response = await fetch('/album-colors.json');
            const allColors = await response.json();
            
            // Filter to only include featured albums for better performance
            const palettes: Record<string, ColorPalette> = {};
            const featuredAlbums = recent.slice(0, appConfig.homepage.hero.numberOfFeaturedAlbums);
            
            for (const album of featuredAlbums) {
              if (allColors[album.uri_release]) {
                palettes[album.uri_release] = allColors[album.uri_release];
              } else {
                // Fallback to default palette
                palettes[album.uri_release] = {
                  background: '#1a1a2e',
                  foreground: '#ffffff',
                  accent: '#0066cc',
                  muted: '#666666',
                };
              }
            }
            
            setColorPalettes(palettes);
          } catch (error) {
            console.warn('Failed to load pre-generated colors, using defaults:', error);
            // Set default palettes for all featured albums
            const palettes: Record<string, ColorPalette> = {};
            const featuredAlbums = recent.slice(0, appConfig.homepage.hero.numberOfFeaturedAlbums);
            
            for (const album of featuredAlbums) {
              palettes[album.uri_release] = {
                background: '#1a1a2e',
                foreground: '#ffffff',
                accent: '#0066cc',
                muted: '#666666',
              };
            }
            
            setColorPalettes(palettes);
          }
        };
        
        loadColors();
      })
      .catch(error => console.error('Error loading collection:', error));
  }, []);

  // Auto-rotate featured albums
  useEffect(() => {
    if (recentAlbums.length > 0) {
      const interval = setInterval(() => {
        setFeaturedIndex((prev) => (prev + 1) % Math.min(appConfig.homepage.hero.numberOfFeaturedAlbums, recentAlbums.length));
      }, appConfig.homepage.hero.autoRotateInterval);
      return () => clearInterval(interval);
    }
  }, [recentAlbums]);

  // Auto-rotate random collection with better control
  useEffect(() => {
    if (randomCollectionItems.length > 0 && randomAutoRotateEnabled) {
      const interval = setInterval(() => {
        setRandomFeaturedIndex((prev) => (prev + 1) % randomCollectionItems.length);
      }, appConfig.homepage.randomCollection.autoRotateInterval);
      return () => clearInterval(interval);
    }
  }, [randomCollectionItems, randomAutoRotateEnabled]);

  // Handle manual navigation for random collection
  const handleRandomNavigation = (newIndex: number) => {
    setRandomAutoRotateEnabled(false);
    setRandomFeaturedIndex(newIndex);
    
    // Re-enable auto-rotation after 10 seconds of no manual interaction
    setTimeout(() => {
      setRandomAutoRotateEnabled(true);
    }, 10000);
  };

  const featuredAlbums = recentAlbums.slice(0, appConfig.homepage.hero.numberOfFeaturedAlbums);
  const currentFeatured = featuredAlbums[featuredIndex];
  const currentPalette = currentFeatured ? colorPalettes[currentFeatured.uri_release] : null;

  // Get top genres (calculated from state if albums are loaded)
  const topGenres = albums.length > 0 
    ? Object.entries(albums.reduce((acc, album) => {
        album.genre_names.forEach(genre => {
          acc[genre] = (acc[genre] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>))
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
    : [];

  // Section component mapping
  const sectionComponents = {
    hero: () => (
      <HeroSection
        currentFeatured={currentFeatured}
        featuredAlbums={featuredAlbums}
        featuredIndex={featuredIndex}
        setFeaturedIndex={setFeaturedIndex}
        currentPalette={currentPalette}
      />
    ),
    recentAlbums: () => <RecentAlbumsSection recentAlbums={recentAlbums} />,
    recentArtists: () => <RecentArtistsSection recentArtists={recentArtists} />,
    genres: () => (
      <GenresSection
        topGenres={topGenres}
        randomizedGenreAlbums={randomizedGenreAlbums}
      />
    ),
    randomCollection: () => (
      <RandomCollectionSection
        randomCollectionItems={randomCollectionItems}
        randomFeaturedIndex={randomFeaturedIndex}
        handleRandomNavigation={handleRandomNavigation}
      />
    ),
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-16">
      {appConfig.homepage.sectionOrder.map((sectionKey, index) => {
        const SectionComponent = sectionComponents[sectionKey as keyof typeof sectionComponents];
        return SectionComponent ? <div key={sectionKey}>{SectionComponent()}</div> : null;
      })}
    </div>
  );
}