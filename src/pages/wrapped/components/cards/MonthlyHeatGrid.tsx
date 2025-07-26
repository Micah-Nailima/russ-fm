import { StatCardData, GridSize } from '@/types/wrapped';
import { Music } from 'lucide-react';

interface MonthlyHeatGridProps {
  stat: StatCardData;
  size: GridSize;
}

export function MonthlyHeatGrid({ stat }: MonthlyHeatGridProps) {
  const timelineData = stat.data as Array<{ month: string; count: number; releases: unknown[] }>;
  
  if (!timelineData || !Array.isArray(timelineData)) {
    return null;
  }

  // Calculate intensity for heat mapping
  const maxCount = Math.max(...timelineData.map(m => m.count));
  const minCount = Math.min(...timelineData.map(m => m.count));
  const range = maxCount - minCount || 1;

  // Get intensity (0-1) for heat mapping
  const getIntensity = (count: number) => {
    if (maxCount === 0) return 0;
    return (count - minCount) / range;
  };

  // Get heat color based on intensity
  const getHeatColor = (intensity: number) => {
    if (intensity === 0) return 'bg-white/10';
    if (intensity < 0.2) return 'bg-gradient-to-br from-blue-400/30 to-blue-500/40';
    if (intensity < 0.4) return 'bg-gradient-to-br from-blue-500/50 to-purple-500/60';
    if (intensity < 0.6) return 'bg-gradient-to-br from-purple-500/60 to-pink-500/70';
    if (intensity < 0.8) return 'bg-gradient-to-br from-pink-500/70 to-red-500/80';
    return 'bg-gradient-to-br from-red-500/80 to-orange-400/90';
  };

  // Get glow effect for high intensity
  const getGlowEffect = (intensity: number) => {
    if (intensity > 0.7) return 'shadow-lg shadow-red-500/20';
    if (intensity > 0.5) return 'shadow-md shadow-purple-500/15';
    if (intensity > 0.3) return 'shadow-sm shadow-blue-500/10';
    return '';
  };

  // Arrange months in 4x3 grid (3 months per row)
  const rows = [
    timelineData.slice(0, 3),   // Jan, Feb, Mar
    timelineData.slice(3, 6),   // Apr, May, Jun
    timelineData.slice(6, 9),   // Jul, Aug, Sep
    timelineData.slice(9, 12),  // Oct, Nov, Dec
  ];

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:20px_20px]" />
      </div>

      {/* Content */}
      <div className="relative h-full p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-white/90 text-lg">
            {stat.title}
          </div>
          <Music className="w-5 h-5 text-white/70" />
        </div>

        {/* Heat Grid */}
        <div className="flex-1 flex flex-col gap-2">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-2 flex-1">
              {row.map((month) => {
                const intensity = getIntensity(month.count);
                const heatColor = getHeatColor(intensity);
                const glowEffect = getGlowEffect(intensity);
                
                return (
                  <div
                    key={month.month}
                    className={`
                      flex-1 rounded-lg transition-all duration-300 hover:scale-105 cursor-pointer
                      ${heatColor} ${glowEffect}
                      border border-white/20 backdrop-blur-sm
                      relative overflow-hidden group
                    `}
                    title={`${month.month}: ${month.count} releases`}
                  >
                    {/* Shimmer effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    {/* Content */}
                    <div className="relative h-full flex flex-col items-center justify-center p-2">
                      <div className="text-white/90 font-bold text-lg leading-none">
                        {month.count}
                      </div>
                      <div className="text-white/70 text-xs font-medium mt-1">
                        {month.month.slice(0, 3)}
                      </div>
                    </div>

                    {/* Pulse effect for high activity */}
                    {intensity > 0.8 && (
                      <div className="absolute inset-0 rounded-lg bg-white/10 animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer stats */}
        <div className="mt-3 flex justify-between text-xs text-white/60">
          <span>Peak: {maxCount}</span>
          <span>Total: {timelineData.reduce((sum, m) => sum + m.count, 0)}</span>
          <span>Avg: {Math.round(timelineData.reduce((sum, m) => sum + m.count, 0) / 12)}</span>
        </div>
      </div>
    </div>
  );
}