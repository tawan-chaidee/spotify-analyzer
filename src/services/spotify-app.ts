import type {
  SelectedSpotifyApp,
  SpotifyAppSource,
} from "../models/auth";

export const SPOTIFY_APP_STORAGE_KEY =
  "spotify-top-explorer-app-selection";

interface StoredSpotifyAppSelection {
  source: SpotifyAppSource;
  ownClientId?: string;
}

export function normalizeSpotifyClientId(value: string): string {
  return value.trim();
}

export function isValidSpotifyClientId(value: string): boolean {
  return /^[a-f0-9]{32}$/i.test(normalizeSpotifyClientId(value));
}

function readStoredSelection(): StoredSpotifyAppSelection | null {
  const raw = localStorage.getItem(SPOTIFY_APP_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredSpotifyAppSelection>;
    if (parsed.source !== "own" && parsed.source !== "owner") {
      localStorage.removeItem(SPOTIFY_APP_STORAGE_KEY);
      return null;
    }
    return {
      source: parsed.source,
      ownClientId:
        typeof parsed.ownClientId === "string"
          ? parsed.ownClientId
          : undefined,
    };
  } catch {
    localStorage.removeItem(SPOTIFY_APP_STORAGE_KEY);
    return null;
  }
}

function storeSelection(selection: StoredSpotifyAppSelection): void {
  localStorage.setItem(
    SPOTIFY_APP_STORAGE_KEY,
    JSON.stringify(selection),
  );
}

export function readSpotifyApp(
  ownerClientId: string,
): SelectedSpotifyApp | null {
  const selection = readStoredSelection();
  if (!selection) return null;

  if (selection.source === "owner") {
    const clientId = normalizeSpotifyClientId(ownerClientId);
    return isValidSpotifyClientId(clientId)
      ? { source: "owner", clientId }
      : null;
  }

  const clientId = normalizeSpotifyClientId(
    selection.ownClientId || "",
  );
  if (!isValidSpotifyClientId(clientId)) {
    localStorage.removeItem(SPOTIFY_APP_STORAGE_KEY);
    return null;
  }
  return { source: "own", clientId };
}

export function saveOwnSpotifyApp(
  value: string,
): SelectedSpotifyApp {
  const clientId = normalizeSpotifyClientId(value);
  if (!isValidSpotifyClientId(clientId)) {
    throw new Error("Enter a valid 32-character Spotify Client ID.");
  }

  storeSelection({ source: "own", ownClientId: clientId });
  return { source: "own", clientId };
}

export function saveOwnerSpotifyApp(
  ownerClientId: string,
): SelectedSpotifyApp {
  const clientId = normalizeSpotifyClientId(ownerClientId);
  if (!isValidSpotifyClientId(clientId)) {
    throw new Error("The configured Owner Access Client ID is invalid.");
  }

  storeSelection({ source: "owner" });
  return { source: "owner", clientId };
}

export function clearSpotifyApp(): void {
  localStorage.removeItem(SPOTIFY_APP_STORAGE_KEY);
}
