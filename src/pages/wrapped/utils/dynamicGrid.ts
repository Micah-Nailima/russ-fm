import { GridItem, GridSize, GridItemType, ImageSize, GridSpan, StatCardData, WrappedData, WrappedRelease, WrappedArtist } from '@/types/wrapped';

// Seeded random number generator for consistent results per year
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// Size weights for weighted random selection
const SIZE_WEIGHTS = {
  small: 60,   // 60% - Most common (1x1)
  medium: 25,  // 25% - Medium frequency (2x2) 
  large: 15    // 15% - Rare, hero content (3x3)
};

// Get square grid span for a size
function getSquareSpan(size: GridSize): GridSpan {
  const spans = { small: 1, medium: 2, large: 3 };
  const span = spans[size];
  return { cols: span, rows: span };
}

// Get optimal image size based on card size and type
function getOptimalImageSize(size: GridSize, type: GridItemType): ImageSize {
  if (type === 'artist') {
    const artistImageSizes = {
      small: 'avatar' as ImageSize,
      medium: 'medium' as ImageSize,
      large: 'hi-res' as ImageSize
    };
    return artistImageSizes[size];
  } else {
    const releaseImageSizes = {
      small: 'medium' as ImageSize,   // Medium for 1x1 release cards
      medium: 'medium' as ImageSize,  // Medium for 2x2 release cards
      large: 'hi-res' as ImageSize    // Hi-res for 3x3 release cards
    };
    return releaseImageSizes[size];
  }
}

// Weighted random size selection
function getWeightedRandomSize(rng: SeededRandom, type: GridItemType, index: number): GridSize {
  // Hero content strategy: first 3 releases get guaranteed large/medium
  if (type === 'release' && index < 3) {
    return rng.next() < 0.6 ? 'large' : 'medium';
  }

  // Stat cards prefer small/medium sizes
  if (type === 'stat') {
    return rng.next() < 0.7 ? 'small' : 'medium';
  }

  // Weighted random selection
  const totalWeight = SIZE_WEIGHTS.small + SIZE_WEIGHTS.medium + SIZE_WEIGHTS.large;
  const random = rng.next() * totalWeight;

  if (random < SIZE_WEIGHTS.small) return 'small';
  if (random < SIZE_WEIGHTS.small + SIZE_WEIGHTS.medium) return 'medium';
  return 'large';
}

// Create stat cards data
function createStatCards(data: WrappedData): StatCardData[] {
  return [
    {
      type: 'total',
      title: 'Total Releases',
      value: data.summary.totalReleases,
    },
    {
      type: 'peak',
      title: 'Peak Month',
      value: data.summary.peakMonth,
      data: data.insights.timeline.find(t => t.month === data.summary.peakMonth)?.releases || []
    },
    {
      type: 'average',
      title: 'Per Month',
      value: data.summary.avgPerMonth,
    },
    {
      type: 'unique',
      title: 'Unique Artists',
      value: data.summary.uniqueArtists,
    },
    {
      type: 'first',
      title: 'First Addition',
      value: data.summary.firstAddition,
      data: data.releases[0]?.release
    },
    {
      type: 'last',
      title: 'Last Addition', 
      value: data.summary.lastAddition,
      data: data.releases[data.releases.length - 1]?.release
    },
    {
      type: 'decades',
      title: 'Release Decades',
      value: data.insights.decades.length,
      data: data.insights.decades
    },
    {
      type: 'timeline',
      title: 'Monthly Timeline',
      value: 'Timeline',
      data: data.insights.timeline
    },
    {
      type: 'genres',
      title: 'Top Genres',
      value: data.insights.genres.length,
      data: data.insights.genres.slice(0, 5)
    }
  ];
}

// Shuffle and mix content types
function shuffleAndMix(
  releases: WrappedRelease[],
  artists: WrappedArtist[],
  statCards: StatCardData[],
  rng: SeededRandom
): Array<{ type: GridItemType; data: WrappedRelease | WrappedArtist | StatCardData; originalIndex?: number }> {
  const content: Array<{ type: GridItemType; data: WrappedRelease | WrappedArtist | StatCardData; originalIndex?: number }> = [];

  // Add all releases
  releases.forEach((release, index) => {
    content.push({ type: 'release', data: release, originalIndex: index });
  });

  // Add all unique artists
  artists.forEach(artist => {
    content.push({ type: 'artist', data: artist });
  });

  // Shuffle the content
  const shuffledContent = rng.shuffle(content);

  // Insert stat cards at strategic intervals (every 8-12 items)
  const result: Array<{ type: GridItemType; data: WrappedRelease | WrappedArtist | StatCardData; originalIndex?: number }> = [];
  let statCardIndex = 0;

  shuffledContent.forEach((item, index) => {
    result.push(item);

    // Insert stat card every 8-12 items
    if ((index + 1) % rng.nextInt(8, 12) === 0 && statCardIndex < statCards.length) {
      result.push({ type: 'stat', data: statCards[statCardIndex] });
      statCardIndex++;
    }
  });

  // Add remaining stat cards at the end
  while (statCardIndex < statCards.length) {
    result.push({ type: 'stat', data: statCards[statCardIndex] });
    statCardIndex++;
  }

  return result;
}

// Generate dynamic grid layout
export function generateDynamicGrid(data: WrappedData): GridItem[] {
  const rng = new SeededRandom(data.year);
  
  // Use ALL releases and artists, not just top ones
  const allReleases = data.releases.map(r => r.release);
  const allArtists = data.insights.artists;
  const statCards = createStatCards(data);

  // Shuffle and mix content
  const mixedContent = shuffleAndMix(allReleases, allArtists, statCards, rng);

  // Generate grid items with sizes and optimizations
  const gridItems: GridItem[] = mixedContent.map((item, index) => {
    const size = getWeightedRandomSize(rng, item.type, item.originalIndex || index);
    const gridSpan = getSquareSpan(size);
    const imageSize = getOptimalImageSize(size, item.type);
    
    return {
      id: `${item.type}-${index}`,
      type: item.type,
      data: item.data,
      size,
      gridSpan,
      imageSize,
      animationDelay: Math.min(index * 20, 300) // Reduced stagger, max 300ms
    };
  });

  return gridItems;
}

// CSS class utilities for grid items
export function getGridClasses(item: GridItem): string {
  const { cols, rows } = item.gridSpan;
  return `col-span-${cols} row-span-${rows}`;
}

// Animation utilities
export function getAnimationType(index: number): string {
  const animations = ['scaleUp', 'slideUp', 'slideLeft', 'slideRight', 'fadeIn'];
  return animations[index % animations.length];
}