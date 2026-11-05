import { describe, expect, it } from "vitest";
import { createListeningFixture } from "../fixtures/listening";
import { createDashboardModel } from "../../src/services/dashboard";

describe("dashboard model", () => {
  it("calculates ranking movement and statistics", () => {
    const model = createDashboardModel(createListeningFixture(), {
      type: "tracks",
      range: "medium_term",
    });

    expect(model.ranking.rows).toHaveLength(4);
    expect(model.ranking.rows[0].trend).toEqual({
      direction: "up",
      places: 1,
    });
    expect(model.ranking.rows[3].trend).toEqual({ direction: "new" });
    expect(model.stats[0].value).toBe("4");
    expect(model.insights.sharedItemCount).toBe(3);
  });

  it("generates artist rows", () => {
    const model = createDashboardModel(createListeningFixture(), {
      type: "artists",
      range: "medium_term",
    });

    expect(model.ranking.rows.map((row) => row.title)).toEqual([
      "Artist A",
      "Artist B",
    ]);
    expect(model.ranking.showTrend).toBe(true);
    expect(model.ranking.rows[0].trend).toEqual({ direction: "stable" });
    expect(model.ranking.rows[1].trend).toEqual({ direction: "new" });
  });

  it("infers album rankings and movement from top tracks", () => {
    const model = createDashboardModel(createListeningFixture(), {
      type: "albums",
      range: "medium_term",
    });

    expect(model.ranking.rows.map((row) => row.title)).toEqual([
      "Album 1",
      "Album 2",
      "Album 3",
      "Album 4",
    ]);
    expect(model.ranking.rows[0].trend).toEqual({
      direction: "up",
      places: 1,
    });
    expect(model.ranking.rows[1].trend).toEqual({
      direction: "down",
      places: 1,
    });
    expect(model.ranking.rows[2].trend).toEqual({ direction: "stable" });
    expect(model.ranking.rows[3].trend).toEqual({ direction: "new" });
    expect(model.insights.sharedItemCount).toBe(3);
  });
});
