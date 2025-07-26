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
    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gradient-to-br from-emerald-700 to-teal-700 p-4 flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-white">Monthly Activity</h3>
      <div className="flex items-end justify-between gap-1 flex-1">
        {timeline.map((month) => (
          <div key={month.month} className="flex flex-col items-center gap-1 flex-1 h-full">
            <div className="flex flex-col justify-end h-full w-full">
              <div
                className="bg-white rounded-t w-full transition-all duration-500 hover:bg-white/80"
                style={{
                  height: `${maxCount > 0 ? Math.max((month.count / maxCount) * 60, month.count > 0 ? 4 : 2) : 2}px`
                }}
                title={`${month.month}: ${month.count} releases`}
              />
            </div>
            <span className="text-xs text-white/80 transform -rotate-45 origin-center mt-1">
              {month.month.slice(0, 3)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}