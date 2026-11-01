// @vitest-environment happy-dom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RankingRow } from "../../src/components/ranking-row";

const row = {
  id: "track-1",
  rank: 1,
  title: "Blouse",
  subtitle: "Clairo · Sling",
  imageUrl: "/test-fixtures/covers/album-01.svg",
  spotifyUrl: "https://open.spotify.com/track/example",
  trend: { direction: "up" as const, places: 2 },
};

describe("RankingRow", () => {
  it("renders visible trend text and a safe Spotify link", () => {
    render(
      <ol>
        <RankingRow row={row} showTrend />
      </ol>,
    );

    expect(screen.getByText("Up 2")).toBeTruthy();
    expect(
      screen.getByText("Blouse").closest("a")?.getAttribute("href"),
    ).toBe("https://open.spotify.com/track/example");
  });

  it("does not link an unsafe URL", () => {
    render(
      <ol>
        <RankingRow
          row={{ ...row, spotifyUrl: "javascript:alert(1)" }}
          showTrend={false}
        />
      </ol>,
    );

    expect(screen.getByText("Blouse").closest("a")).toBeNull();
  });

  it("falls back when artwork fails", () => {
    render(
      <ol>
        <RankingRow row={row} showTrend={false} />
      </ol>,
    );

    const image = document.querySelector("img");
    expect(image).not.toBeNull();
    fireEvent.error(image!);
    expect(document.querySelector("img")).toBeNull();
  });
});
