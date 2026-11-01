import { describe, expect, it, vi } from "vitest";
import type { SpotifyClient } from "../../src/api/spotify/client";
import type { Artist, Track } from "../../src/models/listening";
import { loadAllRankings } from "../../src/services/rankings";

const track = (id: string): Track => ({
  id,
  title: id,
  artistNames: ["Test artist"],
  album: {
    id: "album-1",
    title: "Test album",
    releaseDate: "2026-01-01",
    imageUrl: "",
    spotifyUrl: "",
  },
  durationMs: 180_000,
  explicit: false,
  spotifyUrl: "",
});

const artist = (id: string): Artist => ({
  id,
  name: id,
  imageUrl: "",
  spotifyUrl: "",
});

describe("ranking orchestration", () => {
  it("loads all track and artist ranges and assembles one model", async () => {
    const spotify: SpotifyClient = {
      getTopTracks: vi.fn(async (range) => [track(`track-${range}`)]),
      getTopArtists: vi.fn(async (range) => [artist(`artist-${range}`)]),
    };

    const data = await loadAllRankings(spotify);

    expect(spotify.getTopTracks).toHaveBeenCalledTimes(3);
    expect(spotify.getTopArtists).toHaveBeenCalledTimes(3);
    expect(spotify.getTopTracks).toHaveBeenCalledWith("short_term", 50);
    expect(spotify.getTopTracks).toHaveBeenCalledWith("medium_term", 50);
    expect(spotify.getTopTracks).toHaveBeenCalledWith("long_term", 50);
    expect(data.tracks.short_term[0].id).toBe("track-short_term");
    expect(data.tracks.medium_term[0].id).toBe("track-medium_term");
    expect(data.tracks.long_term[0].id).toBe("track-long_term");
    expect(data.artists.short_term[0].id).toBe("artist-short_term");
    expect(data.artists.medium_term[0].id).toBe("artist-medium_term");
    expect(data.artists.long_term[0].id).toBe("artist-long_term");
  });
});
