import { BaseCard } from './BaseCard';
import { TrendingUp } from 'lucide-react';
import { WrappedRelease } from '@/types/wrapped';

interface PeakMonthCardProps {
  month: string;
  releases: WrappedRelease[];
}

export function PeakMonthCard({ month, releases }: PeakMonthCardProps) {
  return (
    <BaseCard className="flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h4 className="font-medium">Peak Month</h4>
      </div>
      <div className="text-2xl font-bold">{month}</div>
      <p className="text-sm text-muted-foreground mt-1">{releases.length} releases</p>
      {releases.length > 0 && releases[0] && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
          Including "{releases[0].release_name}"
        </p>
      )}
    </BaseCard>
  );
}