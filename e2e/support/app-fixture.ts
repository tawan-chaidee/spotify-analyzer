import { readFile } from "node:fs/promises";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { AUTH_TOKEN_STORAGE_KEY } from "../../src/services/auth";
import { SPOTIFY_APP_STORAGE_KEY } from "../../src/services/spotify-app";

const FIXTURE_CLIENT_ID = "0123456789abcdef0123456789abcdef";

interface FixturePage<T> {
  items: T[];
}

interface Fixture {
  tracks: Record<string, FixturePage<unknown>>;
  artists: Record<string, FixturePage<unknown>>;
}

let fixture: Fixture | null = null;

async function loadFixture(): Promise<Fixture> {
  fixture ??= JSON.parse(
    await readFile(
      new URL("../../public/test-fixtures/spotify-api.json", import.meta.url),
      "utf8",
    ),
  ) as Fixture;
  return fixture;
}

export async function seedAuth(page: Page): Promise<void> {
  await page.addInitScript(
    ({ authKey, appKey, token }) => {
      localStorage.setItem(appKey, JSON.stringify({ source: "owner" }));
      localStorage.setItem(authKey, JSON.stringify(token));
    },
    {
      authKey: AUTH_TOKEN_STORAGE_KEY,
      appKey: SPOTIFY_APP_STORAGE_KEY,
      clientId: FIXTURE_CLIENT_ID,
      token: {
        version: 2,
        clientId: FIXTURE_CLIENT_ID,
        accessToken: "fixture-access-token",
        refreshToken: "fixture-refresh-token",
        accessTokenExpiresAt: Date.now() + 60 * 60 * 1000,
        refreshTokenIssuedAt: Date.now(),
      },
    },
  );
}

export async function mockSpotify(page: Page): Promise<void> {
  const data = await loadFixture();

  await page.route("https://**", async (route) => {
    const url = route.request().url();
    if (
      url.startsWith("https://api.spotify.com/") ||
      url.startsWith("http://127.0.0.1:5174/")
    ) {
      await route.continue();
      return;
    }
    await route.abort();
  });

  await page.route("https://api.spotify.com/v1/me/top/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const parts = url.pathname.split("/");
    const type = parts.at(-1);
    const range = url.searchParams.get("time_range") || "medium_term";

    expect(request.headers().authorization).toBe(
      "Bearer fixture-access-token",
    );
    expect(url.searchParams.get("limit")).toBe("50");
    expect(type === "tracks" || type === "artists").toBe(true);

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        data[type as "tracks" | "artists"][range],
      ),
    });
  });
}
