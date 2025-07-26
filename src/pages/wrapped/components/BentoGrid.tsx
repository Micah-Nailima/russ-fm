import { WrappedData } from '@/types/wrapped';
import { TopAlbumsCard } from './cards/TopAlbumsCard';
import { TopArtistsCard } from './cards/TopArtistsCard';
import { GenreDistributionCard } from './cards/GenreDistributionCard';
import { TotalCountCard } from './cards/TotalCountCard';
import { PeakMonthCard } from './cards/PeakMonthCard';
import { AveragePerMonthCard } from './cards/AveragePerMonthCard';
import { ReleaseDecadesCard } from './cards/FormatTypesCard';
import { UniqueArtistsCard } from './cards/UniqueArtistsCard';
import { FirstAdditionCard } from './cards/FirstAdditionCard';
import { LastAdditionCard } from './cards/LastAdditionCard';
import { MonthlyTimelineCard } from './cards/MonthlyTimelineCard';
import { FeaturedAlbumCard } from './cards/FeaturedAlbumCard';

interface BentoGridProps {
  data: WrappedData;
}

export function BentoGrid({ data }: BentoGridProps) {
  // Select some featured albums from the releases
  const featuredAlbums = data.insights.topAlbums.slice(6, 9); // Get 3 albums after the top 6

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
      {/* Top Albums - Large (3x2) */}
      <div className="col-span-1 md:col-span-2 lg:col-span-3 row-span-2">
        <TopAlbumsCard albums={data.insights.topAlbums.slice(0, 6)} />
      </div>

      {/* Total Count - Medium */}
      <div className="col-span-1">
        <TotalCountCard count={data.summary.totalReleases} />
      </div>

      {/* Peak Month - Medium */}
      <div className="col-span-1">
        <PeakMonthCard 
          month={data.summary.peakMonth} 
          releases={data.insights.timeline.find(t => t.month === data.summary.peakMonth)?.releases || []}
        />
      </div>

      {/* Featured Album 1 - Small */}
      {featuredAlbums[0] && (
        <div className="col-span-1">
          <FeaturedAlbumCard album={featuredAlbums[0]} />
        </div>
      )}

      {/* Genre Distribution - Large (2x2) */}
      <div className="col-span-1 md:col-span-2 row-span-2">
        <GenreDistributionCard genres={data.insights.genres.slice(0, 5)} />
      </div>

      {/* Featured Album 2 - Small */}
      {featuredAlbums[1] && (
        <div className="col-span-1">
          <FeaturedAlbumCard album={featuredAlbums[1]} />
        </div>
      )}

      {/* Average per Month - Small */}
      <div className="col-span-1">
        <AveragePerMonthCard average={data.summary.avgPerMonth} />
      </div>

      {/* Top Artists - Large (2x2) */}
      <div className="col-span-1 md:col-span-2 row-span-2">
        <TopArtistsCard artists={data.insights.topArtists.slice(0, 4)} />
      </div>

      {/* Featured Album 3 - Small */}
      {featuredAlbums[2] && (
        <div className="col-span-1">
          <FeaturedAlbumCard album={featuredAlbums[2]} />
        </div>
      )}

      {/* Release Decades - Small */}
      <div className="col-span-1">
        <ReleaseDecadesCard decades={data.insights.decades} />
      </div>

      {/* Monthly Timeline - Medium (2x1) */}
      <div className="col-span-1 md:col-span-2">
        <MonthlyTimelineCard timeline={data.insights.timeline} />
      </div>

      {/* Unique Artists - Small */}
      <div className="col-span-1">
        <UniqueArtistsCard count={data.summary.uniqueArtists} />
      </div>

      {/* First Addition - Small */}
      <div className="col-span-1">
        <FirstAdditionCard 
          date={data.summary.firstAddition}
          release={data.releases[0]?.release}
        />
      </div>

      {/* Last Addition - Small */}
      <div className="col-span-1">
        <LastAdditionCard 
          date={data.summary.lastAddition}
          release={data.releases[data.releases.length - 1]?.release}
        />
      </div>
    </div>
  );
}