import { describe, expect, it } from "vitest";
import {
  mapSpotifyArtist,
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
});
