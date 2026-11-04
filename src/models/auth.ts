export type SpotifyAppSource = "own" | "owner";

export interface SelectedSpotifyApp {
  source: SpotifyAppSource;
  clientId: string;
}

export interface StoredSpotifyAuth {
  version: 2;
  clientId: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenIssuedAt: number;
}

export interface StoredSpotifyAuthWithPersistence
  extends StoredSpotifyAuth {
  persistent: boolean;
}
