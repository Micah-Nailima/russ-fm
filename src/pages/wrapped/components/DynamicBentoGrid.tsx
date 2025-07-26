import { WrappedData, GridItem, WrappedRelease, WrappedArtist, StatCardData } from '@/types/wrapped';
import { generateDynamicGrid, getGridClasses, getAnimationType } from '../utils/dynamicGrid';
import { IndividualReleaseCard } from './cards/IndividualReleaseCard';
import { IndividualArtistCard } from './cards/IndividualArtistCard';
import { DynamicStatCard } from './cards/DynamicStatCard';
import { AnimatedCard } from './AnimatedCard';

interface DynamicBentoGridProps {
  data: WrappedData;
}

export function DynamicBentoGrid({ data }: DynamicBentoGridProps) {
  const gridItems = generateDynamicGrid(data);

  return (
    <div className="dynamic-bento-grid gap-2 mb-8">
      {gridItems.map((item, index) => (
        <AnimatedCard 
          key={item.id}
          delay={item.animationDelay}
          animation={getAnimationType(index) as 'scaleUp' | 'slideUp' | 'slideLeft' | 'slideRight' | 'fadeIn'}
          className={getGridClasses(item)}
        >
          <GridItemRenderer item={item} />
        </AnimatedCard>
      ))}
    </div>
  );
}

interface GridItemRendererProps {
  item: GridItem;
}

// Adapter functions to convert wrapped data to card-expected formats
function adaptWrappedReleaseToCard(wrappedRelease: WrappedRelease) {
  return {
    slug: wrappedRelease.slug,
    title: wrappedRelease.release_name,
    artist_name: wrappedRelease.release_artist,
    images: wrappedRelease.images,
    date_added: wrappedRelease.date_added
  };
}

function adaptWrappedArtistToCard(wrappedArtist: WrappedArtist) {
  return {
    name: wrappedArtist.name,
    slug: wrappedArtist.slug,
    count: wrappedArtist.count,
    images: wrappedArtist.images,
    topAlbum: wrappedArtist.topAlbum
  };
}

function GridItemRenderer({ item }: GridItemRendererProps) {
  switch (item.type) {
    case 'release':
      return (
        <IndividualReleaseCard 
          release={adaptWrappedReleaseToCard(item.data as WrappedRelease)} 
          size={item.size}
          imageSize={item.imageSize}
        />
      );
    
    case 'artist':
      return (
        <IndividualArtistCard 
          artist={adaptWrappedArtistToCard(item.data as WrappedArtist)} 
          size={item.size}
          imageSize={item.imageSize}
        />
      );
    
    case 'stat':
      return (
        <DynamicStatCard 
          stat={item.data as StatCardData} 
          size={item.size}
        />
      );
    
    default:
      return null;
  }
}