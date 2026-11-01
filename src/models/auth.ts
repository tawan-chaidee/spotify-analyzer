export interface StoredSpotifyAuth {
  version: 1;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenIssuedAt: number;
}

export interface StoredSpotifyAuthWithPersistence
  extends StoredSpotifyAuth {
  persistent: boolean;
}
