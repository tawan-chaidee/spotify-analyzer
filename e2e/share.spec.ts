import { expect, test } from "@playwright/test";
import { mockSpotify, seedAuth } from "./support/app-fixture";

test("creates and opens a no-login share link", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:5174",
  });
  await seedAuth(page);
  await mockSpotify(page);
  await page.goto("/");

  await page.getByText("Copy share link", { exact: true }).click();
  await expect(page.getByText("Link copied", { exact: true })).toBeVisible();
  const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
  expect(shareUrl).toContain("#share=gz.");

  const sharedPage = await context.newPage();
  await sharedPage.goto(shareUrl);
  await expect(sharedPage.getByText("Your friend’s taste.")).toBeVisible();
  await expect(sharedPage.getByText("See your own taste")).toBeVisible();
  await expect(
    sharedPage.getByRole("button", { name: "Playlists" }),
  ).toHaveCount(0);
});

test("rejects malformed share links", async ({ page }) => {
  await page.goto("/#share=gz.invalid");
  await expect(
    page.getByText(/Unable to open shared view/),
  ).toBeVisible();
});
