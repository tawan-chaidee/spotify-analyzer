import type { SpotifyClient } from "../api/spotify/client";
import {
  mapSpotifyArtist,
  mapSpotifyPlaylist,
  mapSpotifyPlaylistTrack,
  mapSpotifyTrack,
} from "../api/spotify/mappers";
import type {
  SpotifyArtistDto,
  SpotifyPlaylistDto,
  SpotifyPlaylistTrackItemDto,
  SpotifyTopItemsResponse,
  SpotifyTrackDto,
} from "../api/spotify/types";
import type { PlaylistTrack } from "../models/playlist";

interface MockPlaylist extends SpotifyPlaylistDto {
  track_ids: string[];
}

interface MockFixture {
  tracks: Record<string, SpotifyTopItemsResponse<SpotifyTrackDto>>;
  artists: Record<string, SpotifyTopItemsResponse<SpotifyArtistDto>>;
  playlists: {
    current_user_id: string;
    items: MockPlaylist[];
  };
}

let fixturePromise: Promise<MockFixture> | null = null;

function loadFixture(): Promise<MockFixture> {
  fixturePromise ??= fetch(
    new URL("test-fixtures/spotify-api.json", document.baseURI),
    { cache: "no-store" },
  ).then(async (response) => {
    if (!response.ok) {
      throw new Error("The local Spotify fixture could not be loaded.");
    }
    return response.json() as Promise<MockFixture>;
  });
  return fixturePromise;
}

export function createMockSpotifyClient(): SpotifyClient {
  return {
    async getTopTracks(range, limit) {
      const fixture = await loadFixture();
      return (fixture.tracks[range]?.items || [])
        .slice(0, limit)
        .map(mapSpotifyTrack);
    },

    async getTopArtists(range, limit) {
      const fixture = await loadFixture();
      return (fixture.artists[range]?.items || [])
        .slice(0, limit)
        .map(mapSpotifyArtist);
    },

    async getCurrentUserId() {
      const fixture = await loadFixture();
      return fixture.playlists.current_user_id;
    },

    async getPlaylists() {
      const fixture = await loadFixture();
      return fixture.playlists.items.map((playlist) =>
        mapSpotifyPlaylist(
          playlist,
          fixture.playlists.current_user_id,
        ),
      );
    },

    async getPlaylistTracks(playlistId) {
      const fixture = await loadFixture();
      const playlist = fixture.playlists.items.find(
        (item) => item.id === playlistId,
      );
      if (!playlist) return [];

      const tracks = new Map(
        Object.values(fixture.tracks)
          .flatMap((page) => page.items)
          .map((track) => [track.id, track]),
      );
      const items: SpotifyPlaylistTrackItemDto[] = playlist.track_ids.map(
        (trackId, index) => ({
          added_at: `2026-0${Math.min(9, 1 + Math.floor(index / 10))}-01T00:00:00Z`,
          item: tracks.get(trackId) || null,
        }),
      );

      return items
        .map(mapSpotifyPlaylistTrack)
        .filter((track): track is PlaylistTrack => Boolean(track));
    },
  };
}
