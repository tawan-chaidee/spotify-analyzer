import { describe, expect, it } from "vitest";
import { rankAlbums } from "../../src/services/albums";
import { createListeningFixture } from "../fixtures/listening";

describe("album ranking", () => {
  it("combines multiple ranked tracks into one album score", () => {
    const fixture = createListeningFixture();
    const tracks = fixture.tracks.medium_term;
    tracks[1] = {
      ...tracks[1],
      album: tracks[0].album,
    };

    const albums = rankAlbums(tracks);

    expect(albums[0]).toMatchObject({
      title: "Album 1",
      rank: 1,
      score: 7,
      trackCount: 2,
      bestTrackRank: 1,
      artistNames: "Artist 1, Guest, Artist 2",
    });
  });
});
