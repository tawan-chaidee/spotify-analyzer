# Spotify Integration

Last verified: 2026-11-21 · Application version: 0.4.0

## Overview

All Spotify communication happens directly between the browser and Spotify.
There is no API proxy on Cloudflare.

```text
Svelte UI
  → SpotifySession / SpotifyClient
  → https://accounts.spotify.com
  → https://api.spotify.com/v1
```

The public `SpotifyClient` interface in `src/api/spotify/client.ts` is implemented
twice:

- Live Spotify HTTP client
- Deterministic fixture client in `src/mocks/spotify-client.ts`

This boundary keeps UI and ranking logic independent from the data source.

## OAuth

The app uses the Authorization Code flow with PKCE.

Requested scopes:

```text
user-top-read
playlist-read-private
playlist-read-collaborative
user-read-private
```

No Client Secret is used.

### Redirect URIs

| Environment | Redirect behavior |
| --- | --- |
| `127.0.0.1` development | `http://127.0.0.1:<port>/callback` |
| HTTPS deployment | Current site origin and path |
| `localhost` over HTTPS | Rejected by the app |
| Plain HTTP outside loopback | Rejected by the app |

The exact local URI must be registered in the Spotify Developer Dashboard.
Changing the Vite port therefore requires a matching Spotify redirect URI.

### Token storage

Tokens are stored under `spotify-top-explorer-token`.

- Remember me uses `localStorage`.
- Per-tab sessions use `sessionStorage`.
- Stored auth records are scoped to the selected Spotify Client ID.
- Access tokens are refreshed before expiry with a 60-second safety buffer.
- A failed refresh clears stored authentication.

Selected Spotify app metadata is stored under
`spotify-top-explorer-app-selection`.

## Spotify endpoints

### Current user

```text
GET /v1/me
```

Used to compare playlist ownership.

### Top tracks and artists

```text
GET /v1/me/top/tracks?time_range=<range>&limit=50
GET /v1/me/top/artists?time_range=<range>&limit=50
```

Supported ranges:

```text
short_term   approximately 4 weeks
medium_term  approximately 6 months
long_term    approximately 1 year
```

These are rolling ranges, not calendar-year values.

### Current user playlists

```text
GET /v1/me/playlists?limit=50&offset=<offset>
```

The client follows offset pagination until a short page is returned or the
safety limit of 1,000 items is reached.

Playlist summary counts prefer the current `items.total` field and retain a
fallback to deprecated `tracks.total`.

### Playlist items

```text
GET /v1/playlists/{playlist_id}/items?limit=50&offset=<offset>
```

Current Spotify policy only exposes items for playlists owned by the current
user or playlists where that user is a collaborator. A followed,
non-collaborative playlist may appear in `/me/playlists` but return `403` for
its items.

The app checks ownership/collaboration before requesting items and shows an
explanatory message instead of treating this expected restriction as a network
failure.

The response mapper accepts the current `item` property and the deprecated
`track` property.

## DTO to model mapping

Raw Spotify types are isolated in:

```text
src/api/spotify/types.ts
```

Mapping functions are in:

```text
src/api/spotify/mappers.ts
```

The app normalizes remote data into:

```text
Track
Artist
Album
PlaylistSummary
PlaylistTrack
```

UI and ranking code does not consume raw Spotify DTOs.

## Error handling

### 401 Unauthorized

The client refreshes the access token and retries the request once.

### 403 Forbidden

The UI distinguishes:

- Account not allowed to use the selected Spotify app
- Missing playlist scopes requiring reconnect
- Followed playlist whose items Spotify does not expose

### 429 Rate limited

`Retry-After` is extracted and shown in the error message.

### Invalid or damaged share data

Share data is decompressed and validated by the sharing services. Invalid
payloads do not reach dashboard rendering.

## Mock integration

The fixture client loads:

```text
public/test-fixtures/spotify-api.json
```

It implements the same top-track, top-artist, current-user, playlist, and
playlist-item methods as the live client.

Fixture data includes:

- 50 tracks in each time range
- Unique top artists
- Owned, followed, and collaborative playlists
- Deterministic generated artwork

Playwright intercepts Spotify HTTP requests and serves equivalent fixture
responses. Automated tests never call Spotify.

## Spotify operational constraints

- The app reads only the top 50 tracks and artists per range.
- Spotify Development Mode applications have user allowlist and approval
  restrictions.
- Bring-your-own Client IDs let each visitor use an independently configured
  Spotify app, but do not bypass Spotify policy.
- Playlist item access follows Spotify’s current owner/collaborator rule.
- The app does not create or modify Spotify data.
