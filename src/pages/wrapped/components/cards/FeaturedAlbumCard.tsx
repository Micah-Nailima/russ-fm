import { Link } from 'react-router-dom';
import { BaseCard } from './BaseCard';

interface Album {
  slug: string;
  title: string;
  artist_name: string;
  image: string;
  date_added: string;
}

interface FeaturedAlbumCardProps {
  album: Album;
}

export function FeaturedAlbumCard({ album }: FeaturedAlbumCardProps) {
  return (
    <Link to={`/album/${album.slug}`}>
      <BaseCard className="p-0 overflow-hidden group">
        <div className="relative aspect-square">
          <img
            src={album.image}
            alt={album.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white text-sm font-medium line-clamp-1">{album.title}</p>
              <p className="text-white/80 text-xs line-clamp-1">{album.artist_name}</p>
            </div>
          </div>
        </div>
      </BaseCard>
    </Link>
  );
}