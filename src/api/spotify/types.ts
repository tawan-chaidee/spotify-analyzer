export interface SpotifyImageDto {
  height?: number | null;
  url: string;
  width?: number | null;
}

export interface SpotifyArtistDto {
  id: string;
  name: string;
  images?: SpotifyImageDto[];
  external_urls?: { spotify?: string };
}

export interface SpotifyAlbumDto {
  id: string;
  name: string;
  release_date?: string;
  images?: SpotifyImageDto[];
  external_urls?: { spotify?: string };
}

export interface SpotifyTrackDto {
  id: string;
  name: string;
  artists?: SpotifyArtistDto[];
  album?: SpotifyAlbumDto;
  duration_ms?: number;
  explicit?: boolean;
  external_urls?: { spotify?: string };
}

export interface SpotifyTopItemsResponse<T> {
  items: T[];
}
