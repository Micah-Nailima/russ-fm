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

  return (
    <BaseCard className="flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="w-5 h-5 text-primary" />
        <h4 className="font-medium text-sm">First of Year</h4>
      </div>
      <div className="text-xl font-bold">{formattedDate}</div>
      {release && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {release.release_name} by {release.release_artist}
        </p>
      )}
    </BaseCard>
  );
}