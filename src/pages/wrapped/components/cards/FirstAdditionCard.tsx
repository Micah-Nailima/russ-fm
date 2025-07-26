import { BaseCard } from './BaseCard';
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
    <BaseCard className="flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="w-5 h-5 text-primary" />
        <h4 className="font-medium text-sm">Year Starter</h4>
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