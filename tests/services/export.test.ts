import { describe, expect, it } from "vitest";
import {
  createCompleteCsv,
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

  it("exports all ranges", () => {
    const file = createCompleteCsv(createListeningFixture());
    expect(file.content.split("\n").length).toBeGreaterThan(10);
  });
});
