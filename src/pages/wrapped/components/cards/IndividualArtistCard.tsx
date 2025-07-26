import { ExternalLink } from 'lucide-react';

interface Artist {
  name: string;
  slug: string;
  count: number;
  images?: { 'hi-res'?: string; medium?: string; avatar?: string };
  topAlbum?: {
    slug: string;
    title: string;
    images: { 'hi-res': string; medium: string; small?: string };
  };
}

interface IndividualArtistCardProps {
  artist: Artist;
  size: 'small' | 'medium' | 'wide';
}

export function IndividualArtistCard({ artist, size }: IndividualArtistCardProps) {
  // Use hi-res artist image first, then hi-res album image as fallback
  const artistImage = artist.images?.['hi-res'] || artist.topAlbum?.images?.['hi-res'];
  
  return (
    <div className="relative aspect-square w-full group overflow-hidden rounded-lg bg-gray-900">
      {/* Full background image */}
      {artistImage ? (
        <img 
          src={artistImage}
          alt={artist.name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        /* Fallback gradient background */
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600" />
      )}
      
      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      
      {/* Content overlay - just text at bottom */}
      <div className="absolute inset-0 p-3 flex flex-col justify-end">
        <div className="text-white">
          <h3 className={`font-bold leading-tight line-clamp-2 drop-shadow-lg ${
            size === 'medium' ? 'text-lg' : size === 'wide' ? 'text-base' : 'text-sm'
          }`}>
            {artist.name}
          </h3>
          <p className={`text-white/90 font-medium mt-1 drop-shadow-lg ${
            size === 'medium' ? 'text-sm' : 'text-xs'
          }`}>
            {artist.count} release{artist.count !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Hover overlay with link */}
      <a
        href={`/artist/${artist.slug}`}
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40"
        aria-label={`View ${artist.name} artist page`}
      >
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-200">
          <ExternalLink className="w-6 h-6 text-white" />
        </div>
      </a>
    </div>
  );
}