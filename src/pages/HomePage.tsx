import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, Music, Users } from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { appConfig } from '@/config/app.config';
import { getGenreColor, getGenreTextColor } from '@/lib/genreColors';
import { extractColorsFromImage, type ColorPalette } from '@/lib/colorExtractor';

interface Album {
  release_name: string;
  release_artist: string;
  artists: Array<{
    name: string;
    uri_artist: string;
  }>;
  genre_names: string[];
  uri_release: string;
  date_added: string;
  date_release_year: string;
  images_uri_release: {
    'hi-res': string;
    medium: string;
  };
}

export function HomePage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [recentAlbums, setRecentAlbums] = useState<Album[]>([]);
  const [recentArtists, setRecentArtists] = useState<Array<{ name: string; uri: string; avatar: string; latestAlbum: Album }>>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [randomizedGenreAlbums, setRandomizedGenreAlbums] = useState<Record<string, Album>>({});
  const [randomizedEraAlbums, setRandomizedEraAlbums] = useState<Record<string, Album>>({});
  const [colorPalettes, setColorPalettes] = useState<Record<string, ColorPalette>>({});

  // Refs for intersection observer
  const recentAlbumsRef = useRef(null);
  const recentArtistsRef = useRef(null);
  const genresRef = useRef(null);
  const erasRef = useRef(null);

  // In-view states
  const recentAlbumsInView = useInView(recentAlbumsRef, { once: true, margin: "-100px" });
  const recentArtistsInView = useInView(recentArtistsRef, { once: true, margin: "-100px" });
  const genresInView = useInView(genresRef, { once: true, margin: "-100px" });
  const erasInView = useInView(erasRef, { once: true, margin: "-100px" });

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

        // Calculate stats
        const uniqueArtists = new Set(data.flatMap(album => album.artists.map(artist => artist.name)));
        const uniqueGenres = new Set(data.flatMap(album => album.genre_names));
        const releaseYears = data.map(album => parseInt(album.date_release_year.split('-')[0]));
        const minYear = Math.min(...releaseYears);
        const maxYear = Math.max(...releaseYears);
        const decades = Math.floor((maxYear - minYear) / 10) + 1;

        // Calculate genre counts and albums by decade for randomization
        const genreCounts = data.reduce((acc, album) => {
          album.genre_names.forEach(genre => {
            acc[genre] = (acc[genre] || 0) + 1;
          });
          return acc;
        }, {} as Record<string, number>);

        const albumsByDecade = data.reduce((acc, album) => {
          const year = parseInt(album.date_release_year.split('-')[0]);
          const decade = Math.floor(year / 10) * 10;
          
          // Skip excluded decades
          if (appConfig.homepage.eras.excludedDecades.includes(decade)) {
            return acc;
          }
          
          if (!acc[decade]) acc[decade] = [];
          acc[decade].push(album);
          return acc;
        }, {} as Record<number, Album[]>);

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
            avatar: artist.images_uri_artist?.['hi-res'] || artist.images_uri_artist?.medium || album.images_uri_release['hi-res'],
            latestAlbum: album
          }));

        setRecentArtists(recentArtistsList);

        // Pre-randomize genre and era representative albums (only once on load)
        const genreAlbumMap: Record<string, Album> = {};
        const eraAlbumMap: Record<string, Album> = {};

        // Randomize genre albums
        Object.entries(genreCounts).forEach(([genre]) => {
          const genreAlbums = data.filter(album => album.genre_names.includes(genre));
          if (genreAlbums.length > 0) {
            genreAlbumMap[genre] = genreAlbums[Math.floor(Math.random() * genreAlbums.length)];
          }
        });

        // Randomize era albums
        Object.entries(albumsByDecade).forEach(([decade, albumsInDecade]) => {
          if (albumsInDecade.length > 0) {
            eraAlbumMap[decade] = albumsInDecade[Math.floor(Math.random() * albumsInDecade.length)];
          }
        });

        setRandomizedGenreAlbums(genreAlbumMap);
        setRandomizedEraAlbums(eraAlbumMap);
        
        // Extract colors for featured albums
        const extractColors = async () => {
          const palettes: Record<string, ColorPalette> = {};
          const featuredAlbums = recent.slice(0, appConfig.homepage.hero.numberOfFeaturedAlbums);
          
          for (const album of featuredAlbums) {
            try {
              const palette = await extractColorsFromImage(album.images_uri_release['hi-res']);
              palettes[album.uri_release] = palette;
            } catch (error) {
              console.warn('Failed to extract colors for', album.release_name, error);
            }
          }
          
          setColorPalettes(palettes);
        };
        
        extractColors();
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

  // Get albums by decade for display (from state)
  const displayAlbumsByDecade = albums.length > 0
    ? albums.reduce((acc, album) => {
        const year = parseInt(album.date_release_year.split('-')[0]);
        const decade = Math.floor(year / 10) * 10;
        
        // Skip excluded decades
        if (appConfig.homepage.eras.excludedDecades.includes(decade)) {
          return acc;
        }
        
        if (!acc[decade]) acc[decade] = [];
        acc[decade].push(album);
        return acc;
      }, {} as Record<number, Album[]>)
    : {};

  return (
    <div className="container mx-auto px-4 py-8 space-y-16">
      {/* Hero Section - Featured Albums */}
      {currentFeatured && (
        <motion.section 
          className="relative rounded-3xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Full background album artwork with blur */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`bg-${featuredIndex}`}
              className="absolute inset-0 w-full h-full"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat filter blur-2xl"
                style={{
                  backgroundImage: `url(${currentFeatured.images_uri_release['hi-res']})`,
                  transform: 'scale(1.1)'
                }}
              />
              
              {/* Dynamic gradient overlay */}
              <div 
                className="absolute inset-0"
                style={{
                  background: currentPalette 
                    ? `linear-gradient(135deg, 
                        ${currentPalette.background}E6 0%, 
                        ${currentPalette.background}B3 25%,
                        ${currentPalette.muted}80 50%,
                        ${currentPalette.accent}40 75%,
                        ${currentPalette.background}CC 100%)`
                    : 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 100%)'
                }}
              />
              
              {/* Color bleeding effect */}
              {currentPalette && (
                <>
                  <div 
                    className="absolute top-0 left-0 w-1/3 h-1/3 opacity-30"
                    style={{
                      background: `radial-gradient(ellipse at top left, ${currentPalette.accent}60, transparent 70%)`
                    }}
                  />
                  <div 
                    className="absolute bottom-0 right-0 w-1/2 h-1/2 opacity-20"
                    style={{
                      background: `radial-gradient(ellipse at bottom right, ${currentPalette.muted}80, transparent 70%)`
                    }}
                  />
                </>
              )}
            </motion.div>
          </AnimatePresence>
          
          <div className="relative grid lg:grid-cols-2 gap-8 p-8 lg:p-12 min-h-[400px]">
            {/* Floating Album Artwork - Full Left Side */}
            <div className="relative group flex items-center justify-center lg:justify-start">
              <AnimatePresence mode="wait">
                <motion.div
                  key={featuredIndex}
                  className="relative w-80 h-80 lg:w-full lg:h-full lg:max-w-[400px] lg:max-h-[400px] aspect-square"
                  initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  style={{ perspective: '1000px' }}
                >
                  {/* Glow effect behind album */}
                  <div 
                    className="absolute -inset-8 rounded-3xl opacity-60 blur-2xl"
                    style={{
                      background: currentPalette 
                        ? `radial-gradient(ellipse at center, ${currentPalette.accent}80, ${currentPalette.muted}40, transparent 70%)`
                        : 'radial-gradient(ellipse at center, rgba(255,255,255,0.3), transparent 70%)'
                    }}
                  />
                  
                  {/* Main album cover */}
                  <div 
                    className="relative rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/20 backdrop-blur-sm"
                    style={{
                      boxShadow: currentPalette 
                        ? `0 25px 50px -12px ${currentPalette.background}80, 0 0 0 1px ${currentPalette.accent}30`
                        : '0 25px 50px -12px rgba(0,0,0,0.5)'
                    }}
                  >
                    <img
                      src={currentFeatured.images_uri_release['hi-res']}
                      alt={`${currentFeatured.release_name} by ${currentFeatured.release_artist}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Subtle gradient overlay on artwork */}
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: currentPalette 
                          ? `linear-gradient(135deg, transparent 0%, ${currentPalette.accent}10 100%)`
                          : 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.05) 100%)'
                      }}
                    />
                  </div>
                  
                  {/* Reflection effect */}
                  <div 
                    className="absolute top-full left-0 w-full h-1/2 rounded-b-3xl opacity-20 blur-sm transform scale-y-[-1] origin-top"
                    style={{
                      background: `url(${currentFeatured.images_uri_release['hi-res']})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)'
                    }}
                  />
                </motion.div>
              </AnimatePresence>
              
            </div>

            {/* Album Info - Right Aligned */}
            <AnimatePresence mode="wait">
              <motion.div
                key={featuredIndex}
                className="flex flex-col justify-center text-center lg:text-right space-y-6"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 1.0, delay: 0.4, ease: "easeInOut" }}
              >
                <div className="space-y-4">
                  <motion.h1 
                    className="text-3xl lg:text-4xl xl:text-5xl font-light leading-tight"
                    style={{ 
                      color: '#ffffff',
                      textShadow: currentPalette 
                        ? `0 4px 20px ${currentPalette.background}80, 0 2px 4px rgba(0,0,0,0.5)`
                        : '0 4px 20px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.8)'
                    }}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.8, type: "spring", stiffness: 100 }}
                  >
                    {currentFeatured.release_name}
                  </motion.h1>
                  <motion.p 
                    className="text-lg lg:text-xl font-normal"
                    style={{ 
                      color: '#ffffff',
                      textShadow: currentPalette 
                        ? `0 4px 20px ${currentPalette.background}80, 0 2px 4px rgba(0,0,0,0.5)`
                        : '0 4px 20px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.8)'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    {currentFeatured.release_artist}
                  </motion.p>
                </div>
                
                <motion.div 
                  className="flex flex-wrap gap-2 justify-center lg:justify-end"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {currentFeatured.genre_names.slice(0, 3).map((genre, index) => (
                    <motion.div
                      key={genre}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link to={`/albums/1?genre=${encodeURIComponent(genre)}`}>
                        <Badge
                          className="px-3 py-1 text-sm cursor-pointer"
                          style={{
                            backgroundColor: getGenreColor(genre),
                            color: getGenreTextColor(getGenreColor(genre))
                          }}
                        >
                          {genre}
                        </Badge>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  className="flex flex-col items-center lg:items-end gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Button 
                    asChild 
                    size="lg" 
                    className="rounded-full font-medium px-8 py-3 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    style={{
                      backgroundColor: currentPalette?.accent || 'rgb(var(--primary))',
                      color: currentPalette?.background || 'rgb(var(--primary-foreground))',
                      boxShadow: currentPalette?.accent 
                        ? `0 10px 25px -5px ${currentPalette.accent}40, 0 4px 6px -2px ${currentPalette.accent}20`
                        : undefined
                    }}
                  >
                    <Link to={currentFeatured.uri_release}>
                      Explore Album
                    </Link>
                  </Button>
                  
                  {/* Navigation dots - Now under the button */}
                  <div className="flex items-center gap-3">
                    {featuredAlbums.map((_, index) => (
                      <motion.button
                        key={index}
                        onClick={() => setFeaturedIndex(index)}
                        className="relative group"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {/* Background glow */}
                        <motion.div
                          className="absolute inset-0 rounded-full blur-sm"
                          style={{
                            backgroundColor: currentPalette?.accent || '#ffffff',
                            opacity: index === featuredIndex ? 0.6 : 0
                          }}
                          animate={{
                            scale: index === featuredIndex ? 2.0 : 1,
                            opacity: index === featuredIndex ? 0.6 : 0
                          }}
                          transition={{ duration: 0.3 }}
                        />
                        
                        {/* Main dot */}
                        <motion.div
                          className="relative rounded-full shadow-lg"
                          style={{
                            backgroundColor: index === featuredIndex 
                              ? (currentPalette?.accent || '#ffffff')
                              : 'rgba(255,255,255,0.5)',
                            width: index === featuredIndex ? 16 : 10,
                            height: index === featuredIndex ? 16 : 10,
                          }}
                          animate={{
                            width: index === featuredIndex ? 16 : 10,
                            height: index === featuredIndex ? 16 : 10,
                          }}
                          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                        />
                        
                        {/* Active indicator ring */}
                        {index === featuredIndex && (
                          <motion.div
                            className="absolute inset-0 rounded-full border-2"
                            style={{
                              borderColor: currentPalette?.accent || '#ffffff',
                              width: 24,
                              height: 24,
                              left: -4,
                              top: -4
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 0.7 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.section>
      )}

      {/* Recently Added Carousel */}
      <motion.section
        ref={recentAlbumsRef}
        initial={{ opacity: 0, y: 20 }}
        animate={recentAlbumsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={recentAlbumsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl lg:text-3xl font-light text-foreground">Recently Added Albums</h2>
          <Link to="/albums" className="text-primary hover:text-primary/80 transition-colors">
            View all albums →
          </Link>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {recentAlbums.slice(0, appConfig.homepage.recentlyAdded.displayCount).map((album, index) => (
            <motion.div
              key={album.uri_release}
              initial={{ opacity: 0, y: 20 }}
              animate={recentAlbumsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Link to={album.uri_release} className="group space-y-3 block">
                <motion.div 
                  className="aspect-square rounded-xl overflow-hidden shadow-lg"
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <img
                    src={album.images_uri_release.medium}
                    alt={`${album.release_name} by ${album.release_artist}`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <div className="space-y-1">
                  <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {album.release_name}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {album.release_artist}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Recently Added Artists */}
      <motion.section
        ref={recentArtistsRef}
        initial={{ opacity: 0, y: 20 }}
        animate={recentArtistsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={recentArtistsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl lg:text-3xl font-light text-foreground">Recently Added Artists</h2>
          <Link to="/artists" className="text-primary hover:text-primary/80 transition-colors">
            View all artists →
          </Link>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {recentArtists.map((artist, index) => (
            <motion.div
              key={artist.name}
              initial={{ opacity: 0, y: 20 }}
              animate={recentArtistsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Link to={artist.uri} className="group space-y-3 block">
                <motion.div 
                  className="aspect-square rounded-xl overflow-hidden shadow-lg"
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <div className="space-y-1 text-center">
                  <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {artist.name}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    Latest: {artist.latestAlbum.release_name}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Popular Genres Grid */}
      <motion.section
        ref={genresRef}
        initial={{ opacity: 0, y: 20 }}
        animate={genresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={genresInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl lg:text-3xl font-light text-foreground">Genres</h2>
          <Link to="/genres" className="text-primary hover:text-primary/80 transition-colors">
            Explore all genres →
          </Link>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {topGenres.map(([genre, count], index) => {
            // Get pre-randomized representative album for this genre
            const representativeAlbum = randomizedGenreAlbums[genre];
            
            // Randomize polaroid rotation for natural scatter effect
            const rotation = (index % 2 === 0 ? 1 : -1) * (Math.random() * 6 + 2);
            
            return representativeAlbum ? (
              <motion.div
                key={genre}
                initial={{ opacity: 0, y: 30, rotate: rotation + 15 }}
                animate={genresInView ? { opacity: 1, y: 0, rotate: rotation } : { opacity: 0, y: 30, rotate: rotation + 15 }}
                transition={{ 
                  delay: 0.3 + index * 0.15,
                  type: "spring",
                  stiffness: 100,
                  damping: 12
                }}
                whileHover={{ 
                  scale: 1.05, 
                  rotate: 0,
                  zIndex: 10,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                className="relative"
              >
                <Link to={representativeAlbum.uri_release} className="group block">
                  {/* Polaroid Frame */}
                  <motion.div 
                    className="bg-white p-4 pb-12 shadow-xl rounded-lg"
                    whileHover={{ boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)" }}
                  >
                    {/* Photo */}
                    <div className="aspect-square overflow-hidden rounded-sm">
                      <motion.img
                        src={representativeAlbum.images_uri_release['hi-res']}
                        alt={`${representativeAlbum.release_name} by ${representativeAlbum.release_artist}`}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    
                    {/* Genre Label (handwritten style) */}
                    <div className="absolute bottom-4 left-0 right-0 px-4">
                      <p className="text-center text-slate-700 font-medium text-lg tracking-wide" 
                         style={{ fontFamily: '"Kalam", "Comic Sans MS", cursive' }}>
                        {genre}
                      </p>
                    </div>
                  </motion.div>
                  
                  {/* Subtle tape effect */}
                  <motion.div 
                    className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-yellow-100/80 rounded-sm shadow-sm border border-yellow-200/50 -rotate-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={genresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                    transition={{ delay: 0.5 + index * 0.15 }}
                  />
                </Link>
              </motion.div>
            ) : null;
          })}
        </div>
      </motion.section>

      {/* Era Timeline */}
      <motion.section
        ref={erasRef}
        initial={{ opacity: 0, y: 20 }}
        animate={erasInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2 
          className="text-2xl lg:text-3xl font-light text-foreground mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={erasInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ delay: 0.2 }}
        >
          Eras
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.entries(displayAlbumsByDecade)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([decade, albumsInDecade], index) => {
              const representativeAlbum = randomizedEraAlbums[decade];
              return representativeAlbum ? (
                <motion.div
                  key={decade}
                  initial={{ opacity: 0, y: 30, rotateX: 45 }}
                  animate={erasInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 30, rotateX: 45 }}
                  transition={{ 
                    delay: 0.3 + index * 0.1,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  whileHover={{ 
                    y: -8,
                    rotateX: -5,
                    transition: { type: "spring", stiffness: 300, damping: 20 }
                  }}
                >
                  <Link to={representativeAlbum.uri_release} className="group block">
                    {/* Calendar Page */}
                    <motion.div 
                      className="bg-white rounded-t-lg shadow-xl overflow-hidden"
                      whileHover={{ 
                        boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
                        scale: 1.02
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Calendar Header */}
                      <div className="bg-red-500 text-white px-4 py-2 text-center relative">
                        <div className="flex justify-between items-center">
                          <motion.div 
                            className="w-3 h-3 bg-white rounded-full opacity-80"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          />
                          <div className="font-bold text-lg tracking-wider">{decade}s</div>
                          <motion.div 
                            className="w-3 h-3 bg-white rounded-full opacity-80"
                            animate={{ rotate: -360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          />
                        </div>
                        {/* Spiral holes */}
                        <div className="absolute -top-1 left-8 w-2 h-2 bg-white rounded-full"></div>
                        <div className="absolute -top-1 right-8 w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      
                      {/* Calendar Body */}
                      <div className="bg-white p-4">
                        {/* Album Image */}
                        <div className="aspect-square rounded-lg overflow-hidden mb-3 shadow-md">
                          <motion.img
                            src={representativeAlbum.images_uri_release['hi-res']}
                            alt={`${representativeAlbum.release_name} from the ${decade}s`}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        
                        {/* Calendar Info */}
                        <div className="space-y-2 h-24 flex flex-col">
                          <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 flex-1">
                            {representativeAlbum.release_name}
                          </h3>
                          <p className="text-slate-600 text-xs font-medium">
                            {representativeAlbum.release_artist}
                          </p>
                          
                          {/* Hand-written note style for album count */}
                          <div className="relative mt-2">
                            <motion.div 
                              className="bg-yellow-100 px-2 py-1 rounded-sm shadow-sm transform -rotate-1 inline-block"
                              whileHover={{ rotate: 1, scale: 1.05 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <p className="text-slate-700 text-xs font-medium italic" 
                                 style={{ fontFamily: '"Kalam", "Comic Sans MS", cursive' }}>
                                {albumsInDecade.length} albums
                              </p>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Calendar shadow/depth */}
                      <div className="absolute inset-x-2 -bottom-2 h-2 bg-slate-200 rounded-b-lg -z-10"></div>
                      <div className="absolute inset-x-4 -bottom-4 h-2 bg-slate-100 rounded-b-lg -z-20"></div>
                    </motion.div>
                  </Link>
                </motion.div>
              ) : null;
            })}
        </div>
      </motion.section>
    </div>
  );
}