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
  await expect(page.getByText(/Showing all 50/)).toBeVisible();
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
