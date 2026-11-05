import type {
  Artist,
  ListeningType,
  TimeRange,
  Track,
} from "../../models/listening";
import type {
  PlaylistSummary,
  PlaylistTrack,
} from "../../models/playlist";
import {
  mapSpotifyArtist,
  mapSpotifyPlaylist,
  mapSpotifyPlaylistTrack,
  mapSpotifyTrack,
} from "./mappers";
import type {
  SpotifyArtistDto,
  SpotifyPlaylistDto,
  SpotifyPlaylistTracksResponse,
  SpotifyPlaylistsResponse,
  SpotifyTopItemsResponse,
  SpotifyTrackDto,
  SpotifyUserDto,
} from "./types";

const API_URL = "https://api.spotify.com/v1";

export class SpotifyApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retryAfter?: string,
  ) {
    super(message);
    this.name = "SpotifyApiError";
  }
}

export interface SpotifyClient {
  getTopTracks(range: TimeRange, limit: number): Promise<Track[]>;
  getTopArtists(range: TimeRange, limit: number): Promise<Artist[]>;
  getCurrentUserId(): Promise<string>;
  getPlaylists(): Promise<PlaylistSummary[]>;
  getPlaylistTracks(playlistId: string): Promise<PlaylistTrack[]>;
}

interface SpotifyClientDependencies {
  getAccessToken: (forceRefresh?: boolean) => Promise<string>;
  fetchImpl?: typeof fetch;
}

export function createSpotifyClient({
  getAccessToken,
  fetchImpl = fetch,
}: SpotifyClientDependencies): SpotifyClient {
  async function request<T>(path: string, retry = true): Promise<T> {
    const accessToken = await getAccessToken();
    const response = await fetchImpl(`${API_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401 && retry) {
      const refreshed = await getAccessToken(true);
      const retryResponse = await fetchImpl(`${API_URL}${path}`, {
        headers: {
          Authorization: `Bearer ${refreshed}`,
        },
      });
      return parseResponse<T>(retryResponse);
    }

    return parseResponse<T>(response);
  }

  async function getTop(
    type: ListeningType,
    range: TimeRange,
    limit: number,
  ) {
    return request<SpotifyTopItemsResponse<SpotifyTrackDto | SpotifyArtistDto>>(
      `/me/top/${type}?time_range=${range}&limit=${limit}`,
    );
  }

  async function getAllPages<T>(
    path: string,
    selectItems: (page: unknown) => T[],
  ): Promise<T[]> {
    const items: T[] = [];
    let offset = 0;

    while (offset < 1_000) {
      const separator = path.includes("?") ? "&" : "?";
      const page = await request<unknown>(
        `${path}${separator}limit=50&offset=${offset}`,
      );
      const pageItems = selectItems(page);
      items.push(...pageItems);
      if (pageItems.length < 50) break;
      offset += pageItems.length;
    }

    return items;
  }

  async function getCurrentUserId(): Promise<string> {
    const user = await request<SpotifyUserDto>("/me");
    return user.id;
  }

  return {
    async getTopTracks(range, limit) {
      const response = await getTop("tracks", range, limit);
      return (response.items as SpotifyTrackDto[]).map(mapSpotifyTrack);
    },

    async getTopArtists(range, limit) {
      const response = await getTop("artists", range, limit);
      return (response.items as SpotifyArtistDto[]).map(mapSpotifyArtist);
    },

    getCurrentUserId,

    async getPlaylists() {
      const [currentUserId, playlists] = await Promise.all([
        getCurrentUserId(),
        getAllPages<SpotifyPlaylistDto>(
          "/me/playlists",
          (page) => (page as SpotifyPlaylistsResponse).items || [],
        ),
      ]);

      return playlists.map((playlist) =>
        mapSpotifyPlaylist(playlist, currentUserId),
      );
    },

    async getPlaylistTracks(playlistId) {
      const items = await getAllPages<SpotifyPlaylistTracksResponse["items"][number]>(
        `/playlists/${encodeURIComponent(playlistId)}/items`,
        (page) => (page as SpotifyPlaylistTracksResponse).items || [],
      );
      return items
        .map(mapSpotifyPlaylistTrack)
        .filter((track): track is PlaylistTrack => Boolean(track));
    },
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After") || "a moment";
    throw new SpotifyApiError(
      `Spotify rate limit reached. Try again in ${retryAfter} seconds.`,
      response.status,
      retryAfter,
    );
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new SpotifyApiError(
      data.error?.message || `Spotify request failed (${response.status}).`,
      response.status,
    );
  }
  return data as T;
}
