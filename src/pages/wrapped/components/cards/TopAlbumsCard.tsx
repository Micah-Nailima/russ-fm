import { Link } from 'react-router-dom';
import { BaseCard } from './BaseCard';

interface Album {
  slug: string;
  title: string;
  artist_name: string;
  image: string;
  date_added: string;
}

interface TopAlbumsCardProps {
  albums: Album[];
}

export function TopAlbumsCard({ albums }: TopAlbumsCardProps) {
  return (
    <BaseCard className="p-4">
      <h3 className="text-lg font-semibold mb-4">Top Albums</h3>
      <div className="grid grid-cols-3 gap-2">
        {albums.map((album, index) => (
          <Link
            key={album.slug}
            to={`/album/${album.slug}`}
            className="group relative aspect-square overflow-hidden rounded-md"
          >
            <img
              src={album.image}
              alt={album.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-white text-xs font-medium line-clamp-1">{album.title}</p>
                <p className="text-white/80 text-xs line-clamp-1">{album.artist_name}</p>
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