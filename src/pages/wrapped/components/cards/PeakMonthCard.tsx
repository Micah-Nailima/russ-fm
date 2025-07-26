import { TrendingUp } from 'lucide-react';
import { WrappedRelease } from '@/types/wrapped';

interface PeakMonthCardProps {
  month: string;
  releases: WrappedRelease[];
}

export function PeakMonthCard({ month, releases }: PeakMonthCardProps) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 flex flex-col items-center justify-center text-center p-4">
      <TrendingUp className="w-10 h-10 text-white/90 mb-3" />
      <div className="text-2xl font-bold text-white">{month}</div>
      <p className="text-sm text-white/80 mt-1">{releases.length} releases</p>
      {releases.length > 0 && releases[0] && (
        <p className="text-xs text-white/70 mt-2 line-clamp-2">
          Including "{releases[0].release_name}"
        </p>
      )}
    </div>
  );
}