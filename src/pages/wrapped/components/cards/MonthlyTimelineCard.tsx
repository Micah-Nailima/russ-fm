import { BaseCard } from './BaseCard';
import { WrappedRelease } from '@/types/wrapped';

interface TimelineData {
  month: string;
  count: number;
  releases: WrappedRelease[];
}

interface MonthlyTimelineCardProps {
  timeline: TimelineData[];
}

export function MonthlyTimelineCard({ timeline }: MonthlyTimelineCardProps) {
  const maxCount = Math.max(...timeline.map(t => t.count));
  
  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Monthly Activity</h3>
      <div className="flex items-end justify-between gap-1 h-24">
        {timeline.map((month) => (
          <div key={month.month} className="flex flex-col items-center gap-1 flex-1">
            <div
              className="bg-primary rounded-t w-full transition-all duration-500 hover:bg-primary/80"
              style={{
                height: `${maxCount > 0 ? (month.count / maxCount) * 100 : 0}%`,
                minHeight: month.count > 0 ? '4px' : '2px'
              }}
              title={`${month.month}: ${month.count} releases`}
            />
            <span className="text-xs text-muted-foreground transform -rotate-45 origin-center">
              {month.month.slice(0, 3)}
            </span>
          </div>
        ))}
      </div>
    </BaseCard>
  );
}