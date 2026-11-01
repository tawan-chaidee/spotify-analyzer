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
  });
});
