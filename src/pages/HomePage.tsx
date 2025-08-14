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
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [stats, setStats] = useState({
    totalAlbums: 0,
    totalArtists: 0,
    genreCount: 0,
    decadesSpanned: 0,
    latestAddition: null as Album | null
  });

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

        setStats({
          totalAlbums: data.length,
          totalArtists: uniqueArtists.size,
          genreCount: uniqueGenres.size,
          decadesSpanned: decades,
          latestAddition: recent[0] || null
        });
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

  // Group albums by decade for timeline (excluding configured decades)
  const albumsByDecade = albums.reduce((acc, album) => {
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

  // Get top genres
  const genreCounts = albums.reduce((acc, album) => {
    album.genre_names.forEach(genre => {
      acc[genre] = (acc[genre] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topGenres = Object.entries(genreCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6);

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
          <h2 className="text-2xl lg:text-3xl font-light text-foreground">Recently Added</h2>
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

      {/* Collection Insights Bento Grid */}
      <section>
        <h2 className="text-2xl lg:text-3xl font-light text-foreground mb-8">Collection Insights</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Albums */}
          <Card className="p-6 text-center">
            <Music className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="text-3xl font-light text-foreground mb-1">
              {stats.totalAlbums.toLocaleString()}
            </div>
            <div className="text-muted-foreground text-sm">Albums</div>
          </Card>

          {/* Total Artists */}
          <Card className="p-6 text-center">
            <Users className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="text-3xl font-light text-foreground mb-1">
              {stats.totalArtists.toLocaleString()}
            </div>
            <div className="text-muted-foreground text-sm">Artists</div>
          </Card>

          {/* Genres */}
          <Card className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="text-3xl font-light text-foreground mb-1">
              {stats.genreCount}
            </div>
            <div className="text-muted-foreground text-sm">Genres</div>
          </Card>

          {/* Decades */}
          <Card className="p-6 text-center">
            <Calendar className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="text-3xl font-light text-foreground mb-1">
              {stats.decadesSpanned}
            </div>
            <div className="text-muted-foreground text-sm">Decades</div>
          </Card>
        </div>
      </section>

      {/* Top Genres Grid */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl lg:text-3xl font-light text-foreground">Popular Genres</h2>
          <Link to="/genres" className="text-primary hover:text-primary/80 transition-colors">
            Explore all genres →
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {topGenres.map(([genre, count]) => {
            // Get a random representative album for this genre
            const genreAlbums = albums.filter(album => 
              album.genre_names.includes(genre)
            );
            const representativeAlbum = genreAlbums[Math.floor(Math.random() * genreAlbums.length)];
            
            return (
              <Card key={genre} className="p-6 hover:shadow-lg transition-shadow">
                {representativeAlbum && (
                  <div className="aspect-square w-16 h-16 rounded-lg overflow-hidden mb-4 mx-auto">
                    <img
                      src={representativeAlbum.images_uri_release.medium}
                      alt={genre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="text-center">
                  <h3 className="font-medium text-foreground mb-1">{genre}</h3>
                  <p className="text-muted-foreground text-sm">{count} albums</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Era Timeline */}
      <section>
        <h2 className="text-2xl lg:text-3xl font-light text-foreground mb-8">Explore by Era</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.entries(albumsByDecade)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([decade, albumsInDecade]) => {
              const representativeAlbum = albumsInDecade[Math.floor(Math.random() * albumsInDecade.length)];
              return (
                <Card key={decade} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-square rounded-lg overflow-hidden mb-3">
                    <img
                      src={representativeAlbum.images_uri_release.medium}
                      alt={`${decade}s`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-foreground mb-1">{decade}s</h3>
                    <p className="text-muted-foreground text-sm">{albumsInDecade.length} albums</p>
                  </div>
                </Card>
              );
            })}
        </div>
      </section>
    </div>
  );
}