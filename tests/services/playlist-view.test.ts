import { describe, expect, it } from "vitest";
import type { PlaylistSummary } from "../../src/models/playlist";
import { filterAndSortPlaylists } from "../../src/services/playlist-view";

const playlists: PlaylistSummary[] = [
  {
    id: "owned-small",
    name: "Morning",
    description: "",
    ownerId: "user-1",
    ownerName: "Tawan",
    trackCount: 8,
    imageUrl: "",
    spotifyUrl: "",
    isOwned: true,
    isPublic: false,
    isCollaborative: false,
  },
  {
    id: "followed-large",
    name: "Night Drive",
    description: "",
    ownerId: "user-2",
    ownerName: "Friend",
    trackCount: 42,
    imageUrl: "",
    spotifyUrl: "",
    isOwned: false,
    isPublic: true,
    isCollaborative: false,
  },
];

describe("playlist view", () => {
  it("filters by ownership and searches owner names", () => {
    expect(
      filterAndSortPlaylists(playlists, {
        query: "",
        filter: "owned",
        sort: "spotify",
      }).map((playlist) => playlist.name),
    ).toEqual(["Morning"]);

    expect(
      filterAndSortPlaylists(playlists, {
        query: "friend",
        filter: "all",
        sort: "spotify",
      }).map((playlist) => playlist.name),
    ).toEqual(["Night Drive"]);
  });

  it("sorts by name and track count", () => {
    expect(
      filterAndSortPlaylists(playlists, {
        query: "",
        filter: "all",
        sort: "name",
      }).map((playlist) => playlist.name),
    ).toEqual(["Morning", "Night Drive"]);

    expect(
      filterAndSortPlaylists(playlists, {
        query: "",
        filter: "all",
        sort: "tracks",
      }).map((playlist) => playlist.name),
    ).toEqual(["Night Drive", "Morning"]);
  });
});
