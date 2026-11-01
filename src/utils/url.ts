const SPOTIFY_IMAGE_HOSTS = new Set([
  "i.scdn.co",
  "mosaic.scdn.co",
  "image-cdn-ak.spotifycdn.com",
]);

export function safeSpotifyUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.hostname !== "open.spotify.com"
    ) {
      return null;
    }
    return url.href;
  } catch {
    return null;
  }
}

export function safeArtworkUrl(value: string): string | null {
  if (!value) return null;

  try {
    const url = new URL(value, document.baseURI);
    if (url.origin === window.location.origin) {
      return url.href;
    }
    if (url.protocol !== "https:") {
      return null;
    }
    if (
      SPOTIFY_IMAGE_HOSTS.has(url.hostname) ||
      url.hostname.endsWith(".spotifycdn.com")
    ) {
      return url.href;
    }
  } catch {
    return null;
  }

  return null;
}
