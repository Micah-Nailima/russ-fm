import { BaseCard } from './BaseCard';
import { Calendar } from 'lucide-react';

interface Decade {
  name: string;
  count: number;
}

interface ReleaseDecadesCardProps {
  decades: Decade[];
}

export function ReleaseDecadesCard({ decades }: ReleaseDecadesCardProps) {
  const topDecades = decades.slice(0, 4);
  
  return (
    <BaseCard className="flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-5 h-5 text-primary" />
        <h4 className="font-medium text-sm">Release Decades</h4>
      </div>
      <div className="space-y-1">
        {topDecades.map((decade) => (
          <div key={decade.name} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground truncate">{decade.name}</span>
            <span className="font-medium">{decade.count}</span>
          </div>
        ))}
      </div>
    </BaseCard>
  );
}