import { BaseCard } from './BaseCard';

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
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Top Genres</h3>
      <p className="text-xs text-muted-foreground mb-3">
        Across {totalAlbums} releases
      </p>
      <div className="space-y-3">
        {genres.slice(0, 5).map((genre, index) => (
          <div key={genre.name} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{genre.name}</span>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-xs">{genre.count} albums</span>
                <span className="text-xs">({genre.percentage}%)</span>
              </div>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500"
                style={{
                  width: `${(genre.count / maxCount) * 100}%`,
                  opacity: 1 - (index * 0.15)
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </BaseCard>
  );
}