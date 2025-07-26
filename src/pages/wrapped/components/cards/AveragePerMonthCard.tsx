import { BarChart3 } from 'lucide-react';

interface AveragePerMonthCardProps {
  average: number;
}

export function AveragePerMonthCard({ average }: AveragePerMonthCardProps) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gradient-to-br from-teal-600 to-cyan-600 flex flex-col items-center justify-center text-center">
      <BarChart3 className="w-10 h-10 text-white/90 mb-3" />
      <div className="text-3xl font-bold text-white">{average}</div>
      <p className="text-sm text-white/80 mt-1">Avg per month</p>
    </div>
  );
}