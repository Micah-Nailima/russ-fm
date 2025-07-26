interface Genre {
  name: string;
  count: number;
  percentage: number;
}

interface GenreDistributionCardProps {
  genres: Genre[];
}

export function GenreDistributionCard({ genres }: GenreDistributionCardProps) {
  const maxCount = Math.max(...genres.map(g => g.count));
  const totalAlbums = genres.reduce((sum, genre) => sum + genre.count, 0);

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 p-4 flex flex-col">
      <h3 className="text-lg font-semibold mb-2 text-white">Top Genres</h3>
      <p className="text-xs text-white/70 mb-4">
        Across {totalAlbums} releases
      </p>
      <div className="space-y-3 flex-1">
        {genres.slice(0, 5).map((genre, index) => (
          <div key={genre.name} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-white">{genre.name}</span>
              <div className="flex items-center gap-2 text-white/70">
                <span className="text-xs">{genre.count}</span>
                <span className="text-xs">({genre.percentage}%)</span>
              </div>
            </div>
            <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-500"
                style={{
                  width: `${(genre.count / maxCount) * 100}%`,
                  opacity: 1 - (index * 0.15)
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}