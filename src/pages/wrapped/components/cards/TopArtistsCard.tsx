import { Link } from 'react-router-dom';
import { BaseCard } from './BaseCard';

interface Artist {
  name: string;
  slug: string;
  count: number;
  image?: string;
  topAlbum?: {
    slug: string;
    title: string;
    image: string;
  };
}

interface TopArtistsCardProps {
  artists: Artist[];
}

export function TopArtistsCard({ artists }: TopArtistsCardProps) {
  return (
    <BaseCard className="p-4">
      <h3 className="text-lg font-semibold mb-4">Top Artists</h3>
      <div className="grid grid-cols-2 gap-2">
        {artists.map((artist, index) => (
          <Link
            key={artist.slug}
            to={`/artist/${artist.slug}`}
            className="group relative aspect-square overflow-hidden rounded-md"
          >
            <img
              src={artist.image || artist.topAlbum?.image || '/images/various.png'}
              alt={artist.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-white text-sm font-medium line-clamp-1">{artist.name}</p>
                <p className="text-white/80 text-xs">{artist.count} albums</p>
              </div>
            </div>
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
            )}
          </Link>
        ))}
      </div>
    </BaseCard>
  );
}