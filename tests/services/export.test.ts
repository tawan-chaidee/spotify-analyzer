import { describe, expect, it } from "vitest";
import {
  createCompleteCsv,
  createCompleteJson,
  createCurrentCsv,
  createCurrentJson,
} from "../../src/services/export";
import { createListeningFixture } from "../fixtures/listening";

describe("exports", () => {
  it("escapes commas and quotes in CSV", () => {
    const file = createCurrentCsv(
      createListeningFixture(),
      "tracks",
      "medium_term",
    );
    expect(file.content).toContain('"Alpha, ""One"""');
  });

  it("creates simplified JSON", () => {
    const file = createCurrentJson(
      createListeningFixture(),
      "artists",
      "medium_term",
    );
    const payload = JSON.parse(file.content);
    expect(payload.items[0]).toEqual({
      ranking: 1,
      artist_name: "Artist A",
    });
  });

  it("exports inferred album scores", () => {
    const file = createCurrentJson(
      createListeningFixture(),
      "albums",
      "medium_term",
    );
    const payload = JSON.parse(file.content);

    expect(payload.ranking_type).toBe("albums");
    expect(payload.items[0]).toEqual({
      ranking: 1,
      album_name: "Album 1",
      artist_name: "Artist 1, Guest",
      ranked_tracks: 1,
      best_track_rank: 1,
      score: 4,
    });
  });

  it("exports all ranges", () => {
    const data = createListeningFixture();
    const csv = createCompleteCsv(data);
    const json = createCompleteJson(data);
    const payload = JSON.parse(json.content);

    expect(csv.content.split("\n").length).toBeGreaterThan(10);
    expect(csv.content.split("\n")[0]).toBe(
      "\uFEFFtype,time_range,ranking,name,artist_name,album",
    );
    expect(csv.content).not.toContain("duration_ms");
    expect(csv.content).not.toContain("explicit");
    expect(payload.schema_version).toBe(2);
    expect(payload.data).toBeUndefined();
    expect(payload.tracks.medium_term[0]).toEqual({
      ranking: 1,
      track_name: 'Alpha, "One"',
      artist_name: "Artist 1, Guest",
      album_name: "Album 1",
    });
    expect(json.content).not.toContain("imageUrl");
    expect(json.content).not.toContain("spotifyUrl");
    expect(json.content).not.toContain("explicit");
  });
});
