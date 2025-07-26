import { WrappedData } from '@/types/wrapped';
import { GenreDistributionCard } from './cards/GenreDistributionCard';
import { TotalCountCard } from './cards/TotalCountCard';
import { PeakMonthCard } from './cards/PeakMonthCard';
import { AveragePerMonthCard } from './cards/AveragePerMonthCard';
import { ReleaseDecadesCard } from './cards/FormatTypesCard';
import { UniqueArtistsCard } from './cards/UniqueArtistsCard';
import { FirstAdditionCard } from './cards/FirstAdditionCard';
import { LastAdditionCard } from './cards/LastAdditionCard';
import { MonthlyTimelineCard } from './cards/MonthlyTimelineCard';
import { IndividualReleaseCard } from './cards/IndividualReleaseCard';
import { IndividualArtistCard } from './cards/IndividualArtistCard';
import { AnimatedCard } from './AnimatedCard';

interface BentoGridProps {
  data: WrappedData;
}

export function BentoGrid({ data }: BentoGridProps) {
  // Get top releases and artists for individual cards
  const topReleases = data.insights.topAlbums.slice(0, 8); // Get top 8 releases
  const topArtists = data.insights.topArtists.slice(0, 6); // Get top 6 artists

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 grid-rows-2 md:grid-rows-2 gap-2 mb-8">
      {/* Release 1 - Large (2x2) */}
      {topReleases[0] && (
        <AnimatedCard delay={0} animation="scaleUp" className="col-span-1 md:col-span-2 row-span-2">
          <IndividualReleaseCard release={topReleases[0]} size="large" />
        </AnimatedCard>
      )}

      {/* Total Count - Small */}
      <AnimatedCard delay={100} animation="slideUp" className="col-span-1">
        <TotalCountCard count={data.summary.totalReleases} />
      </AnimatedCard>

      {/* Peak Month - Small */}
      <AnimatedCard delay={200} animation="slideUp" className="col-span-1">
        <PeakMonthCard 
          month={data.summary.peakMonth} 
          releases={data.insights.timeline.find(t => t.month === data.summary.peakMonth)?.releases || []}
        />
      </AnimatedCard>

      {/* Artist 1 - Medium (1x2) */}
      {topArtists[0] && (
        <AnimatedCard delay={150} animation="slideLeft" className="col-span-1 row-span-2">
          <IndividualArtistCard artist={topArtists[0]} size="medium" />
        </AnimatedCard>
      )}

      {/* Release 2 - Medium */}
      {topReleases[1] && (
        <AnimatedCard delay={250} animation="fadeIn" className="col-span-1">
          <IndividualReleaseCard release={topReleases[1]} size="medium" />
        </AnimatedCard>
      )}

      {/* Release 3 - Medium */}
      {topReleases[2] && (
        <AnimatedCard delay={300} animation="fadeIn" className="col-span-1">
          <IndividualReleaseCard release={topReleases[2]} size="medium" />
        </AnimatedCard>
      )}

      {/* Genre Distribution - Large (2x2) */}
      <AnimatedCard delay={350} animation="scaleUp" className="col-span-1 md:col-span-2 row-span-2">
        <GenreDistributionCard genres={data.insights.genres.slice(0, 5)} />
      </AnimatedCard>

      {/* Artist 2 - Small */}
      {topArtists[1] && (
        <AnimatedCard delay={400} animation="slideRight" className="col-span-1">
          <IndividualArtistCard artist={topArtists[1]} size="small" />
        </AnimatedCard>
      )}

      {/* Release 4 - Small */}
      {topReleases[3] && (
        <AnimatedCard delay={450} animation="slideUp" className="col-span-1">
          <IndividualReleaseCard release={topReleases[3]} size="small" />
        </AnimatedCard>
      )}

      {/* Artist 3 - Medium (2x1) */}
      {topArtists[2] && (
        <AnimatedCard delay={500} animation="slideLeft" className="col-span-1 md:col-span-2">
          <IndividualArtistCard artist={topArtists[2]} size="wide" />
        </AnimatedCard>
      )}

      {/* Release 5 - Small */}
      {topReleases[4] && (
        <AnimatedCard delay={550} animation="scaleUp" className="col-span-1">
          <IndividualReleaseCard release={topReleases[4]} size="small" />
        </AnimatedCard>
      )}

      {/* Average per Month - Small */}
      <AnimatedCard delay={600} animation="slideUp" className="col-span-1">
        <AveragePerMonthCard average={data.summary.avgPerMonth} />
      </AnimatedCard>

      {/* Release Decades - Small */}
      <AnimatedCard delay={650} animation="slideUp" className="col-span-1">
        <ReleaseDecadesCard decades={data.insights.decades} />
      </AnimatedCard>

      {/* Monthly Timeline - Timeline */}
      <AnimatedCard delay={800} animation="slideUp" className="col-span-2 row-span-2">
        <MonthlyTimelineCard timeline={data.insights.timeline} />
      </AnimatedCard>

      {/* Artist 4 - Small */}
      {topArtists[3] && (
        <AnimatedCard delay={750} animation="fadeIn" className="col-span-1">
          <IndividualArtistCard artist={topArtists[3]} size="small" />
        </AnimatedCard>
      )}

      {/* Unique Artists - Small */}
      <AnimatedCard delay={800} animation="slideUp" className="col-span-1">
        <UniqueArtistsCard count={data.summary.uniqueArtists} />
      </AnimatedCard>

      {/* Release 6 - Small */}
      {topReleases[5] && (
        <AnimatedCard delay={850} animation="scaleUp" className="col-span-1">
          <IndividualReleaseCard release={topReleases[5]} size="small" />
        </AnimatedCard>
      )}

      {/* First Addition - Small */}
      <AnimatedCard delay={900} animation="slideLeft" className="col-span-1">
        <FirstAdditionCard 
          date={data.summary.firstAddition}
          release={data.releases[0]?.release}
        />
      </AnimatedCard>

      {/* Last Addition - Small */}
      <AnimatedCard delay={950} animation="slideRight" className="col-span-1">
        <LastAdditionCard 
          date={data.summary.lastAddition}
          release={data.releases[data.releases.length - 1]?.release}
        />
      </AnimatedCard>

      {/* Artist 5 - Small */}
      {topArtists[4] && (
        <AnimatedCard delay={1000} animation="fadeIn" className="col-span-1">
          <IndividualArtistCard artist={topArtists[4]} size="small" />
        </AnimatedCard>
      )}

      {/* Release 7 - Small */}
      {topReleases[6] && (
        <AnimatedCard delay={1050} animation="scaleUp" className="col-span-1">
          <IndividualReleaseCard release={topReleases[6]} size="small" />
        </AnimatedCard>
      )}

      {/* Release 8 - Small */}
      {topReleases[7] && (
        <AnimatedCard delay={1100} animation="scaleUp" className="col-span-1">
          <IndividualReleaseCard release={topReleases[7]} size="small" />
        </AnimatedCard>
      )}

      {/* Artist 6 - Small */}
      {topArtists[5] && (
        <AnimatedCard delay={1150} animation="fadeIn" className="col-span-1">
          <IndividualArtistCard artist={topArtists[5]} size="small" />
        </AnimatedCard>
      )}
    </div>
  );
}