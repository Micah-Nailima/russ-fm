import { Calendar } from 'lucide-react';
import { WrappedRelease } from '@/types/wrapped';

interface FirstAdditionCardProps {
  date: string;
  release?: WrappedRelease;
}

export function FirstAdditionCard({ date, release }: FirstAdditionCardProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
  
  const releaseYear = release?.date_release_year;

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gradient-to-br from-yellow-600 to-orange-600 flex flex-col justify-center items-center text-center p-4">
      <Calendar className="w-8 h-8 text-white/90 mb-2" />
      <h4 className="font-medium text-xs text-white/80 mb-2">Year Starter</h4>
      <div className="text-xl font-bold text-white">{formattedDate}</div>
      {release && (
        <div className="mt-2 space-y-1">
          <p className="text-xs font-medium line-clamp-1 text-white">
            {release.release_name}
          </p>
          <p className="text-xs text-white/80 line-clamp-1">
            {release.release_artist}
          </p>
          {releaseYear && (
            <p className="text-xs text-white/60">
              ({releaseYear} release)
            </p>
          )}
        </div>
      )}
    </div>
  );
}