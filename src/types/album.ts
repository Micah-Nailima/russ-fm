export interface Album {
  release_name: string;
  release_artist: string;
  artists: Array<{
    name: string;
    uri_artist: string;
  }>;
  genre_names: string[];
  uri_release: string;
  date_added: string;
  date_release_year: string;
  images_uri_release: {
    'hi-res': string;
    medium: string;
  };
}

export interface Artist {
  name: string;
  uri: string;
  avatar: string;
  latestAlbum: Album;
}