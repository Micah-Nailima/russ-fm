import { BaseCard } from './BaseCard';
import { Disc3 } from 'lucide-react';

interface TotalCountCardProps {
  count: number;
}

export function TotalCountCard({ count }: TotalCountCardProps) {
  return (
    <BaseCard className="flex flex-col items-center justify-center text-center">
      <Disc3 className="w-8 h-8 text-primary mb-2" />
      <div className="text-3xl font-bold">{count}</div>
      <p className="text-sm text-muted-foreground mt-1">Total Releases</p>
    </BaseCard>
  );
}