import { expect, test } from "@playwright/test";

const VISITOR_CLIENT_ID = "89abcdef0123456789abcdef01234567";

test("uses the visitor Client ID for Spotify authorization", async ({
  page,
}) => {
  await page.route("https://accounts.spotify.com/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><title>Mock Spotify</title>",
    });
  });

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Use Your Spotify App" }),
  ).toBeVisible();
  await page.getByLabel("Spotify Client ID").fill(VISITOR_CLIENT_ID);
  await page
    .getByRole("button", { name: "Connect Spotify" })
    .click();
  await page.waitForURL(/accounts\.spotify\.com\/authorize/);

  const url = new URL(page.url());
  expect(url.searchParams.get("client_id")).toBe(VISITOR_CLIENT_ID);
  expect(url.searchParams.get("scope")).toBe("user-top-read");
  expect(url.searchParams.get("redirect_uri")).toBe(
    "http://127.0.0.1:5174/callback",
  );
  expect(url.searchParams.get("code_challenge_method")).toBe("S256");
});

test("Owner Access uses the configured Client ID", async ({ page }) => {
  await page.route("https://accounts.spotify.com/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><title>Mock Spotify</title>",
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Owner Access" }).click();
  await page.waitForURL(/accounts\.spotify\.com\/authorize/);

  const url = new URL(page.url());
  expect(url.searchParams.get("client_id")).toBe(
    "0123456789abcdef0123456789abcdef",
  );
});
