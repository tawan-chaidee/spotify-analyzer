import type { SpotifyClient } from "../api/spotify/client";
import {
  mapSpotifyArtist,
  mapSpotifyTrack,
} from "../api/spotify/mappers";
import type {
  SpotifyArtistDto,
  SpotifyTopItemsResponse,
  SpotifyTrackDto,
} from "../api/spotify/types";

interface MockFixture {
  tracks: Record<string, SpotifyTopItemsResponse<SpotifyTrackDto>>;
  artists: Record<string, SpotifyTopItemsResponse<SpotifyArtistDto>>;
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
  };
}
