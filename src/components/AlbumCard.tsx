import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, MoreHorizontal, Music } from 'lucide-react';
import { SiLastdotfm } from 'react-icons/si';
import { getCleanGenresFromArray } from '@/lib/genreUtils';
import { getAlbumImageFromData, getArtistAvatarFromData, handleImageError } from '@/lib/image-utils';
import { getGenreColor, getGenreTextColor } from '@/lib/genreColors';
import { normalizeSigurRosTitle, normalizeSigurRosArtistName } from '@/lib/sigurRosNormalizer';

interface Album {
  release_name: string;
  release_artist: string;
  artists?: Array<{
    name: string;
    uri_artist: string;
    images_uri_artist: {
      avatar: string;
    };
  }>;
  genre_names: string[];
  date_release_year: string;
  date_added: string;
  uri_release: string;
  images_uri_release: {
    medium: string;
  };
}

interface AlbumCardProps {
  album: Album;
  onClick?: () => void;
}

export function AlbumCard({ album, onClick }: AlbumCardProps) {
  const navigate = useNavigate();
  const year = new Date(album.date_release_year).getFullYear();
  const cleanGenres = getCleanGenresFromArray(album.genre_names, album.release_artist);
  const displayGenres = cleanGenres.slice(0, 4);
  
  // Normalize Sigur Rós names for display ONLY (not for paths/URLs)
  const displayArtistName = normalizeSigurRosArtistName(album.release_artist);
  const displayAlbumName = normalizeSigurRosTitle(album.release_name, album.release_artist);

  const albumPath = album.uri_release.replace('/album/', '').replace('/', '');
  
  const firstArtist = album.artists?.[0] || {
    name: album.release_artist, // Keep original name for data operations
    uri_artist: '',
    images_uri_artist: { avatar: '' }
  };
  
  // Generate avatar URL using R2-aware utility
  const getAvatarUrl = (artist: typeof firstArtist) => {
    return getArtistAvatarFromData(artist.uri_artist);
  };
  
  const getArtistInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (onClick) {
      return (
        <Card 
          variant="interactive"
          className="w-full h-full flex flex-col group"
          onClick={onClick}
        >
          {children}
        </Card>
      );
    }
    return (
      <Link to={`/album/${albumPath}`} className="h-full">
        <Card variant="interactive" className="w-full h-full flex flex-col group">
          {children}
        </Card>
      </Link>
    );
  };

  return (
    <CardWrapper>
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={getAvatarUrl(firstArtist)} 
              alt={firstArtist.name}
              className="object-cover"
              onError={handleImageError}
            />
            <AvatarFallback className="text-xs">
              {getArtistInitials(firstArtist.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <h6 className="text-sm leading-none font-medium">{displayArtistName}</h6>
            <span className="text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 inline mr-1" />
              Added: {new Date(album.date_added).toLocaleDateString()}
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const discogsId = album.uri_release.match(/\/(\d+)\//)?.[1];
                if (discogsId) {
                  window.open(
                    `https://scrobbler.russ.fm/embed/${discogsId}/`,
                    'lastfm-scrobbler',
                    'width=400,height=600,scrollbars=no,resizable=no'
                  );
                }
              }}
            >
              <SiLastdotfm className="mr-2 h-4 w-4" />
              Scrobble to Last.fm
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!onClick) {
                  window.location.href = `/album/${albumPath}`;
                }
              }}
            >
              <Music className="mr-2 h-4 w-4" />
              View Album Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="relative aspect-square bg-muted overflow-hidden">
          <img
            src={getAlbumImageFromData(album.uri_release, 'medium')}
            alt={album.release_name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={handleImageError}
          />
        </div>
        <div className="pt-3 pb-4 px-4 flex-1 flex flex-col">
          <div className="h-12 flex items-start">
            <h2 className="text-base font-semibold line-clamp-2 leading-tight">{displayAlbumName}</h2>
          </div>
          <Separator className="mt-2 mb-2" />
          <div className="flex flex-wrap gap-1">
            <Badge 
              variant="secondary"
              size="xs"
              className="text-xs px-1.5 py-0.5 transition-opacity hover:opacity-80 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/albums/1?year=${year}`);
              }}
            >
              {year}
            </Badge>
            {displayGenres.map((genre, index) => (
              <Badge 
                key={index}
                size="xs"
                className="text-xs px-1.5 py-0.5 transition-opacity hover:opacity-80 cursor-pointer"
                style={{
                  backgroundColor: getGenreColor(genre),
                  color: getGenreTextColor(getGenreColor(genre))
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/albums/1?genre=${encodeURIComponent(genre)}`);
                }}
              >
                {genre}
              </Badge>
            ))}
            {cleanGenres.length > 4 && (
              <Badge variant="outline" size="xs" className="text-xs px-1.5 py-0.5">
                +{cleanGenres.length - 4}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </CardWrapper>
  );
}