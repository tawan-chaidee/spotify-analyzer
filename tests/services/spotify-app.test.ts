// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";
import {
  SPOTIFY_APP_STORAGE_KEY,
  clearSpotifyApp,
  isValidSpotifyClientId,
  readSpotifyApp,
  saveOwnSpotifyApp,
  saveOwnerSpotifyApp,
} from "../../src/services/spotify-app";

const OWNER_ID = "fedcba9876543210fedcba9876543210";
const OWN_ID = "0123456789abcdef0123456789abcdef";

describe("Spotify app selection", () => {
  beforeEach(() => {
    clearSpotifyApp();
  });

  it("starts without an automatically selected owner app", () => {
    expect(readSpotifyApp(OWNER_ID)).toBeNull();
  });

  it("stores and restores a visitor Client ID", () => {
    saveOwnSpotifyApp(`  ${OWN_ID}  `);

    expect(readSpotifyApp(OWNER_ID)).toEqual({
      source: "own",
      clientId: OWN_ID,
    });
  });

  it("stores Owner Access as an explicit choice", () => {
    saveOwnerSpotifyApp(OWNER_ID);

    expect(readSpotifyApp(OWNER_ID)).toEqual({
      source: "owner",
      clientId: OWNER_ID,
    });
  });

  it("rejects malformed Client IDs and removes bad stored data", () => {
    expect(isValidSpotifyClientId("not-a-real-id")).toBe(false);
    localStorage.setItem(
      SPOTIFY_APP_STORAGE_KEY,
      JSON.stringify({ source: "own", ownClientId: "broken" }),
    );

    expect(readSpotifyApp(OWNER_ID)).toBeNull();
    expect(localStorage.getItem(SPOTIFY_APP_STORAGE_KEY)).toBeNull();
  });
});
