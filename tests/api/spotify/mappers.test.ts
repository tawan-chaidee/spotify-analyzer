import { describe, expect, it } from "vitest";
import {
  mapSpotifyArtist,
  mapSpotifyPlaylist,
  mapSpotifyPlaylistTrack,
  mapSpotifyTrack,
} from "../../../src/api/spotify/mappers";

describe("Spotify mappers", () => {
  it("maps tracks to normalized models", () => {
    const result = mapSpotifyTrack({
      id: "track-1",
      name: "Song",
      artists: [{ id: "artist-1", name: "Artist" }],
      album: {
        id: "album-1",
        name: "Album",
        release_date: "2025-01-01",
        images: [{ url: "https://i.scdn.co/image/a" }],
      },
      duration_ms: 123000,
      explicit: true,
    });

    expect(result.title).toBe("Song");
    expect(result.artistNames).toEqual(["Artist"]);
    expect(result.album.title).toBe("Album");
    expect(result.durationMs).toBe(123000);
  });

  it("maps artist images and URLs", () => {
    const result = mapSpotifyArtist({
      id: "artist-1",
      name: "Artist",
      images: [{ url: "https://i.scdn.co/image/a" }],
    });

    expect(result.name).toBe("Artist");
    expect(result.imageUrl).toContain("i.scdn.co");
    expect(result.spotifyUrl).toContain("/artist/artist-1");
  });

  it("maps playlist ownership and metadata", () => {
    const playlist = mapSpotifyPlaylist(
      {
        id: "playlist-1",
        name: "Favorites",
        description: "A private collection",
        owner: { id: "user-1", display_name: "Tawan" },
        images: [{ url: "https://i.scdn.co/image/cover" }],
        items: { total: 24 },
        public: false,
        collaborative: true,
      },
      "user-1",
    );

    expect(playlist).toMatchObject({
      id: "playlist-1",
      name: "Favorites",
      trackCount: 24,
      isOwned: true,
      isPublic: false,
      isCollaborative: true,
    });
    expect(playlist.spotifyUrl).toContain("/playlist/playlist-1");
  });

  it("maps playlist tracks and preserves their added date", () => {
    const track = mapSpotifyPlaylistTrack({
      added_at: "2026-01-02T00:00:00Z",
      item: {
        id: "track-1",
        name: "Song",
        artists: [{ id: "artist-1", name: "Artist" }],
        album: { id: "album-1", name: "Album" },
      },
    });

    expect(track?.title).toBe("Song");
    expect(track?.addedAt).toBe("2026-01-02T00:00:00Z");
  });
});
