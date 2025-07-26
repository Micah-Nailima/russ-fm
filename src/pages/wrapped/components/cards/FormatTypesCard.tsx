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
    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex flex-col justify-center p-4">
      <div className="flex items-center gap-2 mb-3 justify-center">
        <Calendar className="w-6 h-6 text-white/90" />
        <h4 className="font-medium text-sm text-white">Release Decades</h4>
      </div>
      <div className="space-y-2">
        {topDecades.map((decade) => (
          <div key={decade.name} className="flex items-center justify-between text-xs">
            <span className="text-white/80 truncate">{decade.name}</span>
            <span className="font-medium text-white">{decade.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}