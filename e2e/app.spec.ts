import { expect, test } from "@playwright/test";
import { mockSpotify, seedAuth } from "./support/app-fixture";

test("loads the private dashboard and switches rankings", async ({
  page,
}) => {
  await seedAuth(page);
  await mockSpotify(page);
  await page.goto("/");

  await expect(page.getByText("Your listening taste.")).toBeVisible();
  await expect(
    page.locator('[data-component="ranking-list"] li'),
  ).toHaveCount(50);

  await page.getByText("Artists", { exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Top artists" }),
  ).toBeVisible();

  await page.getByText("4 weeks", { exact: true }).click();
  await expect(page.getByText(/Showing all 7/)).toBeVisible();

  await page.getByText("Albums", { exact: true }).click();
  await expect(page.getByRole("heading", { name: "Top albums" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "How albums are ranked" }),
  ).toBeVisible();
  await expect(page.getByText("score = Σ (N − track rank + 1)")).toBeVisible();
});

test("downloads a fixture-backed CSV", async ({ page }) => {
  await seedAuth(page);
  await mockSpotify(page);
  await page.goto("/");

  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "CSV: Full current ranking" })
    .click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).not.toBeNull();
});

test("uses the fixture on a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedAuth(page);
  await mockSpotify(page);
  await page.goto("/");

  await expect(page.getByText("Your listening taste.")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("explains inferred album rankings on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedAuth(page);
  await mockSpotify(page);
  await page.goto("/");

  await page.getByText("Albums", { exact: true }).click();

  await expect(page.getByRole("heading", { name: "Top albums" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "How albums are ranked" }),
  ).toBeVisible();
  await expect(page.getByText(/Deluxe editions remain separate/)).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("explains when Owner Access is not allowlisted", async ({ page }) => {
  await seedAuth(page);
  await page.route("https://api.spotify.com/v1/me/top/**", async (route) => {
    await route.fulfill({
      status: 403,
      contentType: "application/json",
      body: JSON.stringify({ error: { message: "Forbidden" } }),
    });
  });
  await page.goto("/");

  await expect(
    page.getByText(/not approved for Owner Access/i),
  ).toBeVisible();
});

test("changing Spotify apps clears the old connection", async ({ page }) => {
  await seedAuth(page);
  await mockSpotify(page);
  await page.goto("/");

  await page.getByRole("button", { name: "Disconnect" }).click();
  await page.getByRole("button", { name: "Change Spotify app" }).click();

  await expect(
    page.getByRole("heading", { name: "Use Your Spotify App" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      localStorage.getItem("spotify-top-explorer-token"),
    ),
  ).toBeNull();
});
