import { BaseCard } from './BaseCard';
import { Users } from 'lucide-react';

interface UniqueArtistsCardProps {
  count: number;
}

export function UniqueArtistsCard({ count }: UniqueArtistsCardProps) {
  return (
    <BaseCard className="flex flex-col items-center justify-center text-center">
      <Users className="w-6 h-6 text-primary mb-2" />
      <div className="text-2xl font-bold">{count}</div>
      <p className="text-xs text-muted-foreground">Unique artists</p>
    </BaseCard>
  );
}