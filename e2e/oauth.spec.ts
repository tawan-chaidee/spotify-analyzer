import { expect, test } from "@playwright/test";

test("starts Spotify authorization with the expected request", async ({
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
  await page
    .getByRole("button", { name: "Connect Spotify" })
    .click();
  await page.waitForURL(/accounts\.spotify\.com\/authorize/);

  const url = new URL(page.url());
  expect(url.searchParams.get("client_id")).toBe("playwright-client-id");
  expect(url.searchParams.get("scope")).toBe("user-top-read");
  expect(url.searchParams.get("redirect_uri")).toBe(
    "http://127.0.0.1:5174/callback",
  );
  expect(url.searchParams.get("code_challenge_method")).toBe("S256");
});
