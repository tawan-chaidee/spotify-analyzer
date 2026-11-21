import { describe, expect, it } from "vitest";
import type {
  PlaylistSummary,
  PlaylistTrack,
} from "../../src/models/playlist";
import {
  createPlaylistLibraryCsv,
  createPlaylistLibraryJson,
  createPlaylistTracksCsv,
  createPlaylistTracksJson,
} from "../../src/services/playlist-export";
import { createListeningFixture } from "../fixtures/listening";

const playlist: PlaylistSummary = {
  id: "playlist-1",
  name: "Current Rotation",
  description: "Frequently replayed tracks",
  ownerId: "user-1",
  ownerName: "Tawan",
  trackCount: 1,
  imageUrl: "https://i.scdn.co/image/cover",
  spotifyUrl: "https://open.spotify.com/playlist/playlist-1",
  isOwned: true,
  isPublic: false,
  isCollaborative: false,
};

describe("playlist exports", () => {
  const track: PlaylistTrack = {
    ...createListeningFixture().tracks.medium_term[0],
    addedAt: "2026-11-21T00:00:00Z",
  };

  it("exports only useful playlist-library fields", () => {
    const csv = createPlaylistLibraryCsv([playlist]);
    const json = createPlaylistLibraryJson([playlist]);

    expect(csv.content.split("\n")[0]).toBe(
      "\uFEFFplaylist_name,owner,owned,visibility,collaborative,track_count",
    );
    expect(csv.content).not.toContain("spotify_url");
    expect(JSON.stringify(JSON.parse(json.content))).not.toContain(
      "spotify_url",
    );
  });

  it("exports readable playlist track fields and playlist filename", () => {
    const csv = createPlaylistTracksCsv(playlist, [track]);
    const json = createPlaylistTracksJson(playlist, [track]);
    const payload = JSON.parse(json.content);

    expect(csv.filename).toBe("Current Rotation.csv");
    expect(json.filename).toBe("Current Rotation.json");
    expect(csv.content.split("\n")[0]).toBe(
      "\uFEFFposition,track_name,artist_name,album",
    );
    expect(payload.items[0]).toEqual({
      position: 1,
      track_name: 'Alpha, "One"',
      artist_name: "Artist 1, Guest",
      album_name: "Album 1",
    });
    expect(json.content).not.toContain("spotify_url");
    expect(json.content).not.toContain("duration_ms");
    expect(json.content).not.toContain("explicit");
  });
});
