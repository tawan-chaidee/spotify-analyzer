import type {
  StoredSpotifyAuth,
  StoredSpotifyAuthWithPersistence,
} from "../models/auth";

const AUTHORIZE_URL = "https://accounts.spotify.com/authorize";
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const TOKEN_KEY = "spotify-top-explorer-token";
export const AUTH_TOKEN_STORAGE_KEY = TOKEN_KEY;
const VERIFIER_KEY = "spotify-top-explorer-verifier";
const STATE_KEY = "spotify-top-explorer-state";
const PERSIST_KEY = "spotify-top-explorer-persist";
const CALLBACK_CLIENT_ID_KEY =
  "spotify-top-explorer-callback-client-id";
const LOCAL_CALLBACK_PATH = "/callback";
const EXPIRY_BUFFER_MS = 60_000;

let refreshPromise: Promise<StoredSpotifyAuthWithPersistence> | null = null;

interface AuthDependencies {
  clientId: string;
  fetchImpl?: typeof fetch;
  navigate?: (url: string) => void;
  now?: () => number;
}

export type LoginStart = "redirecting" | "authenticated";

export interface AuthService {
  readAuth(): StoredSpotifyAuthWithPersistence | null;
  clearAuth(): void;
  getAccessToken(forceRefresh?: boolean): Promise<string>;
  beginLogin(remember: boolean): Promise<LoginStart>;
  completeLogin(params: URLSearchParams): Promise<void>;
}

function randomString(length: number): string {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join(
    "",
  );
}

async function codeChallenge(verifier: string): Promise<string> {
  const bytes = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function appPath(): string {
  const path = window.location.pathname;
  if (path === LOCAL_CALLBACK_PATH || path.endsWith(LOCAL_CALLBACK_PATH)) {
    const base = path.slice(0, -LOCAL_CALLBACK_PATH.length);
    return base ? `${base}/` : "/";
  }
  return path;
}

interface RedirectLocation {
  protocol: string;
  hostname: string;
  origin: string;
  pathname: string;
}

export function redirectUriFor(location: RedirectLocation): string {
  if (!["http:", "https:"].includes(location.protocol)) {
    return "";
  }

  if (
    location.hostname === "localhost" ||
    location.hostname.endsWith(".localhost")
  ) {
    return "";
  }

  if (location.hostname === "127.0.0.1") {
    return `${location.origin}${LOCAL_CALLBACK_PATH}`;
  }

  if (location.protocol !== "https:") {
    return "";
  }

  return `${location.origin}${location.pathname}`;
}

export function redirectUri(): string {
  return redirectUriFor(window.location);
}

export function readAuth(
  clientId: string,
): StoredSpotifyAuthWithPersistence | null {
  for (const [storage, persistent] of [
    [localStorage, true],
    [sessionStorage, false],
  ] as const) {
    const raw = storage.getItem(TOKEN_KEY);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw) as StoredSpotifyAuth;
      if (
        parsed.version === 2 &&
        parsed.clientId === clientId &&
        typeof parsed.accessToken === "string" &&
        typeof parsed.accessTokenExpiresAt === "number"
      ) {
        return { ...parsed, persistent };
      }
    } catch {
      // Invalid storage is cleared below.
    }

    storage.removeItem(TOKEN_KEY);
  }

  return null;
}

function saveAuth(
  clientId: string,
  auth: Omit<StoredSpotifyAuth, "version" | "clientId">,
  persistent: boolean,
): StoredSpotifyAuthWithPersistence {
  const value: StoredSpotifyAuth = {
    version: 2,
    clientId,
    ...auth,
  };
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  (persistent ? localStorage : sessionStorage).setItem(
    TOKEN_KEY,
    JSON.stringify(value),
  );
  return { ...value, persistent };
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(PERSIST_KEY);
  sessionStorage.removeItem(CALLBACK_CLIENT_ID_KEY);
  refreshPromise = null;
}

export function createAuthService({
  clientId,
  fetchImpl = fetch,
  navigate = (url) => window.location.assign(url),
  now = Date.now,
}: AuthDependencies): AuthService {
  async function tokenRequest(
    body: Record<string, string>,
  ): Promise<Record<string, unknown>> {
    const response = await fetchImpl(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(body),
    });
    const data = (await response.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    if (!response.ok) {
      throw new Error(
        String(
          data.error_description ||
            data.error ||
            "Spotify token request failed.",
        ),
      );
    }
    return data;
  }

  function tokenFromResponse(
    token: Record<string, unknown>,
    previous?: StoredSpotifyAuthWithPersistence,
  ): StoredSpotifyAuthWithPersistence {
    const accessToken = String(token.access_token || "");
    const grantedRefreshToken = String(token.refresh_token || "");
    const refreshToken = grantedRefreshToken || previous?.refreshToken || "";
    const issuedAt =
      grantedRefreshToken || !previous ? now() : previous.refreshTokenIssuedAt;

    return saveAuth(
      clientId,
      {
        accessToken,
        refreshToken,
        accessTokenExpiresAt:
          now() + (Number(token.expires_in) || 3600) * 1000,
        refreshTokenIssuedAt: issuedAt,
      },
      previous?.persistent ?? sessionStorage.getItem(PERSIST_KEY) === "1",
    );
  }

  async function refresh(
    current: StoredSpotifyAuthWithPersistence,
  ): Promise<StoredSpotifyAuthWithPersistence> {
    if (!current.refreshToken) {
      throw new Error("Spotify authorization has expired.");
    }

    try {
      const response = await tokenRequest({
        client_id: clientId,
        grant_type: "refresh_token",
        refresh_token: current.refreshToken,
      });
      return tokenFromResponse(response, current);
    } catch (error) {
      clearAuth();
      throw error;
    }
  }

  async function getAccessToken(forceRefresh = false): Promise<string> {
    const current = readAuth(clientId);
    if (!current) {
      throw new Error("Spotify authorization has expired.");
    }

    if (
      !forceRefresh &&
      current.accessTokenExpiresAt > now() + EXPIRY_BUFFER_MS
    ) {
      return current.accessToken;
    }

    refreshPromise ??= refresh(current).finally(() => {
      refreshPromise = null;
    });
    return (await refreshPromise).accessToken;
  }

  return {
    readAuth: () => readAuth(clientId),
    clearAuth,
    getAccessToken,

    async beginLogin(remember: boolean): Promise<LoginStart> {
      if (!clientId) {
        throw new Error(
          "Choose a Spotify app before starting authorization.",
        );
      }

      const callback = redirectUri();
      if (!callback) {
        throw new Error(
          "Spotify login requires an HTTP or HTTPS page at 127.0.0.1 or a deployed domain.",
        );
      }

      const verifier = randomString(64);
      const state = randomString(32);
      const challenge = await codeChallenge(verifier);
      sessionStorage.setItem(VERIFIER_KEY, verifier);
      sessionStorage.setItem(STATE_KEY, state);
      sessionStorage.setItem(PERSIST_KEY, remember ? "1" : "0");
      sessionStorage.setItem(CALLBACK_CLIENT_ID_KEY, clientId);

      const params = new URLSearchParams({
        client_id: clientId,
        response_type: "code",
        redirect_uri: callback,
        scope: "user-top-read",
        state,
        code_challenge_method: "S256",
        code_challenge: challenge,
      });
      navigate(`${AUTHORIZE_URL}?${params}`);
      return "redirecting";
    },

    async completeLogin(params: URLSearchParams): Promise<void> {
      const callback = redirectUri();
      if (!callback) {
        throw new Error(
          "Spotify authorization must run from an HTTP or HTTPS page.",
        );
      }

      const error = params.get("error");
      if (error) {
        clearAuth();
        throw new Error(`Spotify authorization failed: ${error}`);
      }
      if (params.get("state") !== sessionStorage.getItem(STATE_KEY)) {
        clearAuth();
        throw new Error("Spotify authorization state did not match.");
      }

      const verifier = sessionStorage.getItem(VERIFIER_KEY);
      const code = params.get("code");
      const callbackClientId = sessionStorage.getItem(
        CALLBACK_CLIENT_ID_KEY,
      );
      if (!verifier || !code || callbackClientId !== clientId) {
        clearAuth();
        throw new Error("Spotify did not return a valid authorization code.");
      }

      try {
        const token = await tokenRequest({
          client_id: clientId,
          grant_type: "authorization_code",
          code,
          redirect_uri: callback,
          code_verifier: verifier,
        });
        tokenFromResponse(token);
      } finally {
        sessionStorage.removeItem(VERIFIER_KEY);
        sessionStorage.removeItem(STATE_KEY);
        sessionStorage.removeItem(PERSIST_KEY);
        sessionStorage.removeItem(CALLBACK_CLIENT_ID_KEY);
      }
    },
  };
}

export function createMockAuthService({
  clientId,
  now = Date.now,
}: Pick<AuthDependencies, "clientId" | "now">): AuthService {
  return {
    readAuth: () => readAuth(clientId),
    clearAuth,

    async getAccessToken(): Promise<string> {
      const current = readAuth(clientId);
      if (!current) {
        throw new Error("Mock Spotify authorization has expired.");
      }
      return current.accessToken;
    },

    async beginLogin(remember: boolean): Promise<LoginStart> {
      if (!clientId) {
        throw new Error(
          "Choose a Spotify app before starting mock authorization.",
        );
      }
      saveAuth(
        clientId,
        {
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token",
          accessTokenExpiresAt: now() + 60 * 60 * 1000,
          refreshTokenIssuedAt: now(),
        },
        remember,
      );
      return "authenticated";
    },

    async completeLogin(): Promise<void> {
      return;
    },
  };
}
