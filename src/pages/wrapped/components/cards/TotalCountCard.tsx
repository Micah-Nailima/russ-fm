import { Disc3 } from 'lucide-react';

interface TotalCountCardProps {
  count: number;
}

export function TotalCountCard({ count }: TotalCountCardProps) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex flex-col items-center justify-center text-center">
      <Disc3 className="w-10 h-10 text-white/90 mb-3" />
      <div className="text-3xl font-bold text-white">{count}</div>
      <p className="text-sm text-white/80 mt-1">Total Releases</p>
    </div>
  );
}