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

export interface SpotifyUserDto {
  id: string;
  display_name?: string | null;
}

export interface SpotifyPlaylistDto {
  id: string;
  name: string;
  description?: string | null;
  images?: SpotifyImageDto[];
  owner?: {
    id?: string;
    display_name?: string | null;
  };
  tracks?: {
    total?: number;
  };
  items?: {
    total?: number;
  };
  public?: boolean | null;
  collaborative?: boolean;
  external_urls?: { spotify?: string };
}

export interface SpotifyPlaylistsResponse {
  items: SpotifyPlaylistDto[];
  next?: string | null;
}

export interface SpotifyPlaylistTrackItemDto {
  added_at?: string;
  item?: SpotifyTrackDto | null;
  track?: SpotifyTrackDto | null;
}

export interface SpotifyPlaylistTracksResponse {
  items: SpotifyPlaylistTrackItemDto[];
  next?: string | null;
}
