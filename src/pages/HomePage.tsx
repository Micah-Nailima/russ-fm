import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, Music, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { appConfig } from '@/config/app.config';

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
        <section className="relative">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Album Artwork */}
            <div className="relative group">
              <div className="relative w-80 h-80 lg:w-96 lg:h-96 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={currentFeatured.images_uri_release['hi-res']}
                  alt={`${currentFeatured.release_name} by ${currentFeatured.release_artist}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              
              {/* Navigation dots */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                {featuredAlbums.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setFeaturedIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === featuredIndex 
                        ? 'bg-primary w-8' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Album Info */}
            <div className="text-center lg:text-left space-y-6">
              <div>
                <h1 className="text-4xl lg:text-6xl font-light text-foreground mb-2 leading-tight">
                  {currentFeatured.release_name}
                </h1>
                <p className="text-xl lg:text-2xl text-muted-foreground">
                  {currentFeatured.release_artist}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {currentFeatured.genre_names.slice(0, 3).map(genre => (
                  <span 
                    key={genre}
                    className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              <Button asChild size="lg" className="rounded-full">
                <Link to={currentFeatured.uri_release}>
                  Explore Album
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Recently Added Carousel */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl lg:text-3xl font-light text-foreground">Recently Added Albums</h2>
          <Link to="/albums" className="text-primary hover:text-primary/80 transition-colors">
            View all albums →
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {recentAlbums.slice(0, appConfig.homepage.recentlyAdded.displayCount).map((album) => (
            <Link
              key={album.uri_release}
              to={album.uri_release}
              className="group space-y-3"
            >
              <div className="aspect-square rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <img
                  src={album.images_uri_release.medium}
                  alt={`${album.release_name} by ${album.release_artist}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  {album.release_name}
                </h3>
                <p className="text-muted-foreground text-xs">
                  {album.release_artist}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently Added Artists */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl lg:text-3xl font-light text-foreground">Recently Added Artists</h2>
          <Link to="/artists" className="text-primary hover:text-primary/80 transition-colors">
            View all artists →
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {recentArtists.map((artist) => (
            <Link
              key={artist.name}
              to={artist.uri}
              className="group space-y-3"
            >
              <div className="aspect-square rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <img
                  src={artist.avatar}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1 text-center">
                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  {artist.name}
                </h3>
                <p className="text-muted-foreground text-xs">
                  Latest: {artist.latestAlbum.release_name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Genres Grid */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl lg:text-3xl font-light text-foreground">Genres</h2>
          <Link to="/genres" className="text-primary hover:text-primary/80 transition-colors">
            Explore all genres →
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {topGenres.map(([genre, count], index) => {
            // Get pre-randomized representative album for this genre
            const representativeAlbum = randomizedGenreAlbums[genre];
            
            // Randomize polaroid rotation for natural scatter effect
            const rotation = (index % 2 === 0 ? 1 : -1) * (Math.random() * 6 + 2);
            
            return representativeAlbum ? (
              <Link
                key={genre}
                to={representativeAlbum.uri_release}
                className="group relative transition-all duration-300 hover:scale-105 hover:z-10"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                {/* Polaroid Frame */}
                <div className="bg-white p-4 pb-12 shadow-xl rounded-lg hover:shadow-2xl transition-shadow duration-300">
                  {/* Photo */}
                  <div className="aspect-square overflow-hidden rounded-sm">
                    <img
                      src={representativeAlbum.images_uri_release['hi-res']}
                      alt={`${representativeAlbum.release_name} by ${representativeAlbum.release_artist}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  
                  {/* Genre Label (handwritten style) */}
                  <div className="absolute bottom-4 left-0 right-0 px-4">
                    <p className="text-center text-slate-700 font-medium text-lg tracking-wide" 
                       style={{ fontFamily: '"Kalam", "Comic Sans MS", cursive' }}>
                      {genre}
                    </p>
                  </div>
                </div>
                
                {/* Subtle tape effect */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-yellow-100/80 rounded-sm shadow-sm border border-yellow-200/50 -rotate-3"></div>
              </Link>
            ) : null;
          })}
        </div>
      </section>

      {/* Era Timeline */}
      <section>
        <h2 className="text-2xl lg:text-3xl font-light text-foreground mb-8">Eras</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.entries(displayAlbumsByDecade)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([decade, albumsInDecade]) => {
              const representativeAlbum = randomizedEraAlbums[decade];
              return representativeAlbum ? (
                <Link
                  key={decade}
                  to={representativeAlbum.uri_release}
                  className="group relative"
                >
                  {/* Calendar Page */}
                  <div className="bg-white rounded-t-lg shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105 overflow-hidden">
                    {/* Calendar Header */}
                    <div className="bg-red-500 text-white px-4 py-2 text-center relative">
                      <div className="flex justify-between items-center">
                        <div className="w-3 h-3 bg-white rounded-full opacity-80"></div>
                        <div className="font-bold text-lg tracking-wider">{decade}s</div>
                        <div className="w-3 h-3 bg-white rounded-full opacity-80"></div>
                      </div>
                      {/* Spiral holes */}
                      <div className="absolute -top-1 left-8 w-2 h-2 bg-white rounded-full"></div>
                      <div className="absolute -top-1 right-8 w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    
                    {/* Calendar Body */}
                    <div className="bg-white p-4">
                      {/* Album Image */}
                      <div className="aspect-square rounded-lg overflow-hidden mb-3 shadow-md">
                        <img
                          src={representativeAlbum.images_uri_release['hi-res']}
                          alt={`${representativeAlbum.release_name} from the ${decade}s`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                          <div className="bg-yellow-100 px-2 py-1 rounded-sm shadow-sm transform -rotate-1 inline-block">
                            <p className="text-slate-700 text-xs font-medium italic" 
                               style={{ fontFamily: '"Kalam", "Comic Sans MS", cursive' }}>
                              {albumsInDecade.length} albums
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Calendar shadow/depth */}
                    <div className="absolute inset-x-2 -bottom-2 h-2 bg-slate-200 rounded-b-lg -z-10"></div>
                    <div className="absolute inset-x-4 -bottom-4 h-2 bg-slate-100 rounded-b-lg -z-20"></div>
                  </div>
                </Link>
              ) : null;
            })}
        </div>
      </section>
    </div>
  );
}