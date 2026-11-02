// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AUTH_TOKEN_STORAGE_KEY,
  clearAuth,
  createAuthService,
  readAuth,
  redirectUriFor,
} from "../../src/services/auth";

function storeExpiredAuth(): void {
  localStorage.setItem(
    AUTH_TOKEN_STORAGE_KEY,
    JSON.stringify({
      version: 2,
      clientId: "client-id",
      accessToken: "expired-access-token",
      refreshToken: "refresh-token",
      accessTokenExpiresAt: 1_000,
      refreshTokenIssuedAt: 1_000,
    }),
  );
}

describe("Spotify redirect URI", () => {
  it("uses the callback path for the local loopback address", () => {
    expect(
      redirectUriFor({
        protocol: "http:",
        hostname: "127.0.0.1",
        origin: "http://127.0.0.1:8000",
        pathname: "/",
      }),
    ).toBe("http://127.0.0.1:8000/callback");
  });

  it("uses the current HTTPS production path", () => {
    expect(
      redirectUriFor({
        protocol: "https:",
        hostname: "music.example.com",
        origin: "https://music.example.com",
        pathname: "/",
      }),
    ).toBe("https://music.example.com/");
  });

  it("rejects localhost even over HTTPS", () => {
    expect(
      redirectUriFor({
        protocol: "https:",
        hostname: "localhost",
        origin: "https://localhost:8000",
        pathname: "/",
      }),
    ).toBe("");
  });

  it("rejects non-loopback HTTP and local files", () => {
    expect(
      redirectUriFor({
        protocol: "http:",
        hostname: "example.com",
        origin: "http://example.com",
        pathname: "/",
      }),
    ).toBe("");
    expect(
      redirectUriFor({
        protocol: "file:",
        hostname: "",
        origin: "null",
        pathname: "/index.html",
      }),
    ).toBe("");
  });
});

describe("Spotify token lifecycle", () => {
  beforeEach(() => {
    clearAuth();
  });

  it("shares one refresh request across concurrent callers", async () => {
    storeExpiredAuth();
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: "refreshed-access-token",
          expires_in: 3_600,
        }),
        { status: 200 },
      ),
    );
    const auth = createAuthService({
      clientId: "client-id",
      fetchImpl,
      now: () => 10_000,
    });

    const tokens = await Promise.all([
      auth.getAccessToken(),
      auth.getAccessToken(),
    ]);

    expect(tokens).toEqual([
      "refreshed-access-token",
      "refreshed-access-token",
    ]);
    expect(fetchImpl).toHaveBeenCalledOnce();
    const body = new URLSearchParams(
      String(fetchImpl.mock.calls[0][1]?.body),
    );
    expect(body.get("grant_type")).toBe("refresh_token");
    expect(body.get("refresh_token")).toBe("refresh-token");
    expect(readAuth("client-id")?.accessToken).toBe(
      "refreshed-access-token",
    );
  });

  it("clears stored authentication when refresh is rejected", async () => {
    storeExpiredAuth();
    const auth = createAuthService({
      clientId: "client-id",
      fetchImpl: vi.fn<typeof fetch>().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: "invalid_grant",
            error_description: "Refresh token revoked.",
          }),
          { status: 400 },
        ),
      ),
      now: () => 10_000,
    });

    await expect(auth.getAccessToken()).rejects.toThrow(
      "Refresh token revoked.",
    );
    expect(readAuth("client-id")).toBeNull();
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it("does not expose a token saved for another Spotify app", () => {
    storeExpiredAuth();

    expect(readAuth("different-client-id")).toBeNull();
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });
});
