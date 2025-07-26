import { BaseCard } from './BaseCard';
import { Disc } from 'lucide-react';

interface Format {
  name: string;
  count: number;
}

interface FormatTypesCardProps {
  formats: Format[];
}

export function FormatTypesCard({ formats }: FormatTypesCardProps) {
  const topFormats = formats.slice(0, 3);
  
  return (
    <BaseCard className="flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Disc className="w-5 h-5 text-primary" />
        <h4 className="font-medium text-sm">Formats</h4>
      </div>
      <div className="space-y-1">
        {topFormats.map((format) => (
          <div key={format.name} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground truncate">{format.name}</span>
            <span className="font-medium">{format.count}</span>
          </div>
        ))}
      </div>
    </BaseCard>
  );
}