import { BaseCard } from './BaseCard';
import { BarChart3 } from 'lucide-react';

interface AveragePerMonthCardProps {
  average: number;
}

export function AveragePerMonthCard({ average }: AveragePerMonthCardProps) {
  return (
    <BaseCard className="flex flex-col items-center justify-center text-center">
      <BarChart3 className="w-6 h-6 text-primary mb-2" />
      <div className="text-2xl font-bold">{average}</div>
      <p className="text-xs text-muted-foreground">Avg per month</p>
    </BaseCard>
  );
}