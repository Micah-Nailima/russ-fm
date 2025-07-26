import { WrappedRelease } from '@/types/wrapped';

interface TimelineData {
  month: string;
  count: number;
  releases: WrappedRelease[];
}

interface MonthlyTimelineCardProps {
  timeline: TimelineData[];
}

import React from 'react';

// Tailwind color ramp for heatmap (from light to dark)
const colorRamp = [
  'bg-emerald-100',
  'bg-emerald-200',
  'bg-emerald-300',
  'bg-emerald-400',
  'bg-emerald-500',
  'bg-emerald-600',
  'bg-emerald-700',
  'bg-emerald-800',
  'bg-emerald-900',
];

export function MonthlyTimelineCard({ timeline }: MonthlyTimelineCardProps) {
  const maxCount = Math.max(...timeline.map(t => t.count));

  // Helper to get color index for a count
  function getColorClass(count: number) {
    if (maxCount === 0) return colorRamp[0];
    // 0 = empty, 1 = lowest, 9 = highest
    const idx = Math.ceil((count / maxCount) * (colorRamp.length - 1));
    return colorRamp[idx];
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg bg-gradient-to-br from-emerald-700 to-teal-700 p-4 flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-white">Monthly Activity</h3>
      <div className="grid grid-cols-4 grid-rows-3 gap-2 flex-1">
        {timeline.map((month) => (
          <div
            key={month.month}
            className={`rounded-lg flex flex-col items-center justify-center aspect-square transition-all duration-300 cursor-pointer group ${getColorClass(month.count)}`}
            title={`${month.month}: ${month.count} releases`}
            tabIndex={0}
            aria-label={`${month.month}: ${month.count} releases`}
          >
            <span className="text-xs font-medium text-emerald-950 group-hover:text-emerald-900">
              {month.month.slice(0, 3)}
            </span>
            <span className="text-lg font-bold text-emerald-900 group-hover:text-emerald-950">
              {month.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}