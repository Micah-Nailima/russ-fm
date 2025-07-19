export const appConfig = {
  pagination: {
    itemsPerPage: {
      albums: 20,
      artists: 24,
    },
    showPageNumbers: 5, // Number of page numbers to show before ellipsis
  },
  
  // Other app-wide configurations can be added here
  features: {
    enableSearch: true,
    enableFilters: true,
    enableSorting: true,
  },
  
  // API endpoints or external URLs
  external: {
    discogs: 'https://www.discogs.com',
    spotify: 'https://open.spotify.com',
    appleMusic: 'https://music.apple.com',
    lastfm: 'https://www.last.fm',
  },
  
  // Footer configuration
  footer: {
    links: {
      about: {
        title: 'About',
        items: [
          { label: 'About Russ.fm', href: '/about' },
          { label: 'Collection Stats', href: '/stats' },
          { label: 'Random Discovery', href: '/random' },
        ],
      },
      explore: {
        title: 'Explore',
        items: [
          { label: 'Albums', href: '/albums/1' },
          { label: 'Artists', href: '/artists/1' },
          { label: 'Genres', href: '/genres' },
        ],
      },
      external: {
        title: 'Connect',
        items: [
          { label: 'Discogs', href: 'https://www.discogs.com/user/russmck/collection', external: true },
          { label: 'Last.fm', href: 'http://last.fm/user/RussMckendrick', external: true },
          { label: 'GitHub', href: 'https://github.com/russmckendrick/', external: true },
        ],
      },
    },
    copyright: {
      year: 2025,
      text: 'Russ.fm. A personal record collection showcase.',
    },
  },
};

// Type-safe config getter
export function getConfig<T extends keyof typeof appConfig>(key: T): typeof appConfig[T] {
  return appConfig[key];
}