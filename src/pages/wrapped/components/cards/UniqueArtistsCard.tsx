import { Users } from 'lucide-react';

interface UniqueArtistsCardProps {
  count: number;
}

export function UniqueArtistsCard({ count }: UniqueArtistsCardProps) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gradient-to-br from-orange-600 to-red-600 flex flex-col items-center justify-center text-center">
      <Users className="w-10 h-10 text-white/90 mb-3" />
      <div className="text-3xl font-bold text-white">{count}</div>
      <p className="text-sm text-white/80 mt-1">Unique Artists</p>
    </div>
  );
}