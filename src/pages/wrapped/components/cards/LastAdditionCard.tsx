import { BaseCard } from './BaseCard';
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
    <BaseCard className="flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <CalendarDays className="w-5 h-5 text-primary" />
        <h4 className="font-medium text-sm">
          {isRecent ? "Latest Addition" : "Year Ender"}
        </h4>
      </div>
      <div className="text-xl font-bold">{formattedDate}</div>
      {release && (
        <div className="mt-2 space-y-1">
          <p className="text-xs font-medium line-clamp-1">
            {release.release_name}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {release.release_artist}
          </p>
          {releaseYear && (
            <p className="text-xs text-muted-foreground">
              ({releaseYear} release)
            </p>
          )}
        </div>
      )}
    </BaseCard>
  );
}