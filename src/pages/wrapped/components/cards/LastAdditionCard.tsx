import { CalendarDays } from 'lucide-react';
import { WrappedRelease } from '@/types/wrapped';

interface LastAdditionCardProps {
  date: string;
  release?: WrappedRelease;
}

export function LastAdditionCard({ date, release }: LastAdditionCardProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
  
  const releaseYear = release?.date_release_year;
  const isRecent = release && new Date(release.date_added).getFullYear() === new Date().getFullYear();

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gradient-to-br from-pink-600 to-rose-600 flex flex-col justify-center items-center text-center p-4">
      <CalendarDays className="w-8 h-8 text-white/90 mb-2" />
      <h4 className="font-medium text-xs text-white/80 mb-2">
        {isRecent ? "Latest Addition" : "Year Ender"}
      </h4>
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