import { describe, expect, it, vi } from "vitest";
import { createSpotifyClient } from "../../../src/api/spotify/client";

const trackResponse = {
  items: [
    {
      id: "track-1",
      name: "Test track",
      artists: [{ id: "artist-1", name: "Test artist" }],
      album: {
        id: "album-1",
        name: "Test album",
        release_date: "2026-01-01",
      },
      duration_ms: 180_000,
      explicit: false,
    },
  ],
};

describe("Spotify client", () => {
  it("requests the selected range with a bearer token and 50-item limit", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(trackResponse), { status: 200 }),
    );
    const client = createSpotifyClient({
      getAccessToken: vi.fn().mockResolvedValue("access-token"),
      fetchImpl,
    });

    const tracks = await client.getTopTracks("medium_term", 50);

    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(
      "https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=50",
    );
    expect(init?.headers).toEqual({
      Authorization: "Bearer access-token",
    });
    expect(tracks[0]).toMatchObject({
      id: "track-1",
      title: "Test track",
      artistNames: ["Test artist"],
    });
  });

  it("refreshes and retries once after a 401 response", async () => {
    const getAccessToken = vi
      .fn()
      .mockResolvedValueOnce("expired-token")
      .mockResolvedValueOnce("refreshed-token");
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response("", { status: 401 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [] }), { status: 200 }),
      );
    const client = createSpotifyClient({ getAccessToken, fetchImpl });

    await expect(client.getTopArtists("short_term", 50)).resolves.toEqual([]);

    expect(getAccessToken).toHaveBeenNthCalledWith(2, true);
    expect(fetchImpl.mock.calls[1][1]?.headers).toEqual({
      Authorization: "Bearer refreshed-token",
    });
  });

  it("surfaces Spotify rate-limit metadata", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("", {
        status: 429,
        headers: { "Retry-After": "12" },
      }),
    );
    const client = createSpotifyClient({
      getAccessToken: vi.fn().mockResolvedValue("access-token"),
      fetchImpl,
    });

    await expect(client.getTopTracks("long_term", 50)).rejects.toThrow(
      "Spotify rate limit reached. Try again in 12 seconds.",
    );
  });

  it("loads the normalized playlist library", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockImplementation(
      async (input) => {
        const url = String(input);
        if (url.endsWith("/v1/me")) {
          return new Response(
            JSON.stringify({ id: "user-1", display_name: "Tawan" }),
            { status: 200 },
          );
        }
        return new Response(
          JSON.stringify({
            items: [
              {
                id: "playlist-1",
                name: "Favorites",
                owner: { id: "user-1", display_name: "Tawan" },
                items: { total: 8 },
                public: false,
              },
            ],
            next: null,
          }),
          { status: 200 },
        );
      },
    );
    const client = createSpotifyClient({
      getAccessToken: vi.fn().mockResolvedValue("access-token"),
      fetchImpl,
    });

    const playlists = await client.getPlaylists();

    expect(playlists[0]).toMatchObject({
      id: "playlist-1",
      trackCount: 8,
      isOwned: true,
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("loads every page of playlist tracks", async () => {
    const pageItem = {
      added_at: "2026-01-01T00:00:00Z",
      track: {
        id: "track-1",
        name: "Song",
        artists: [{ id: "artist-1", name: "Artist" }],
        album: { id: "album-1", name: "Album" },
      },
    };
    const fullPage = Array.from({ length: 50 }, (_, index) => ({
      ...pageItem,
      track: { ...pageItem.track, id: `track-${index}` },
    }));
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ items: fullPage, next: "next-page" }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [pageItem], next: null }), {
          status: 200,
        }),
      );
    const client = createSpotifyClient({
      getAccessToken: vi.fn().mockResolvedValue("access-token"),
      fetchImpl,
    });

    const tracks = await client.getPlaylistTracks("playlist-1");

    expect(tracks).toHaveLength(51);
    expect(fetchImpl.mock.calls[0][0]).toContain("/playlist-1/items");
    expect(fetchImpl.mock.calls[1][0]).toContain("offset=50");
  });
});
