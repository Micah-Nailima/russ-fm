export interface WrappedRelease {
  release_name: string;
  release_artist: string;
  date_added: string;
  date_release_year: string;
  genre_names: string[];
  slug: string;
  images: {
    'hi-res': string;
    medium: string;
  };
  artists: Array<{ 
    name: string; 
    slug: string;
    images: {
      'hi-res'?: string;
      medium?: string;
      avatar?: string;
    };
  }>;
}

export interface WrappedAlbumDetail {
  slug: string;
  styles: string[];
  formats: Array<{ name: string; qty: string; descriptions?: string[] }>;
}

export interface WrappedData {
  year: number;
  isYearToDate: boolean;
  lastUpdated: string;
  summary: {
    totalReleases: number;
    uniqueArtists: number;
    topGenre: string;
    topStyle: string;
    avgPerMonth: number;
    peakMonth: string;
    firstAddition: string;
    lastAddition: string;
    projectedTotal?: number;
  };
  releases: Array<{
    release: WrappedRelease;
    albumDetail?: WrappedAlbumDetail;
  }>;
  insights: {
    genres: Array<{ name: string; count: number; percentage: number }>;
    artists: Array<{ name: string; slug: string; count: number; image?: string }>;
    decades: Array<{ name: string; count: number }>;
    timeline: Array<{ month: string; count: number; releases: WrappedRelease[] }>;
    topAlbums: Array<{
      slug: string;
      title: string;
      artist_name: string;
      image: string;
      date_added: string;
    }>;
    topArtists: Array<{
      name: string;
      slug: string;
      count: number;
      image?: string;
      topAlbum?: {
        slug: string;
        title: string;
        image: string;
      };
    }>;
  };
}