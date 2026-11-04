// @vitest-environment happy-dom
import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import RankingRow from "../../src/components/RankingRow.svelte";

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
    render(RankingRow, { props: { row, showTrend: true } });

    expect(screen.getByText("Up 2")).toBeTruthy();
    expect(
      screen.getByText("Blouse").closest("a")?.getAttribute("href"),
    ).toBe("https://open.spotify.com/track/example");
  });

  it("does not link an unsafe URL", () => {
    render(RankingRow, {
      props: {
        row: { ...row, spotifyUrl: "javascript:alert(1)" },
        showTrend: false,
      },
    });

    expect(screen.getByText("Blouse").closest("a")).toBeNull();
  });

  it("falls back when artwork fails", async () => {
    render(RankingRow, { props: { row, showTrend: false } });

    const image = document.querySelector("img");
    expect(image).not.toBeNull();
    await fireEvent.error(image!);
    expect(document.querySelector("img")).toBeNull();
  });
});
