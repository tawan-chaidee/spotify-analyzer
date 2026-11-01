// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { safeArtworkUrl, safeSpotifyUrl } from "../../src/utils/url";

describe("URL safety", () => {
  it("accepts Spotify destinations only", () => {
    expect(safeSpotifyUrl("https://open.spotify.com/track/123")).toContain(
      "open.spotify.com/track/123",
    );
    expect(safeSpotifyUrl("javascript:alert(1)")).toBeNull();
    expect(safeSpotifyUrl("https://example.com/track/123")).toBeNull();
  });

  it("accepts same-origin and Spotify artwork", () => {
    expect(safeArtworkUrl("/test-fixtures/covers/album-01.svg")).toContain(
      "/test-fixtures/covers/album-01.svg",
    );
    expect(safeArtworkUrl("https://i.scdn.co/image/example")).toContain(
      "i.scdn.co",
    );
    expect(safeArtworkUrl("data:image/svg+xml,bad")).toBeNull();
  });
});
