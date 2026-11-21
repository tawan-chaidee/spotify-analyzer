# Architecture

Last verified: 2026-11-21 · Application version: 0.4.0

## System context

Spotify Top Explorer is a static browser application. It does not own,
aggregate, proxy, or persist Spotify data on an application server.

```text
┌──────────────────────────── Browser ────────────────────────────┐
│ Svelte UI                                                       │
│   ├── connection and loading states                             │
│   ├── listening charts                                          │
│   └── playlist library                                          │
│                                                                  │
│ Browser services                                                │
│   ├── PKCE authorization and token refresh                      │
│   ├── Spotify Web API requests                                  │
│   ├── ranking and album inference                               │
│   ├── CSV/JSON export and clipboard                             │
│   └── compressed share snapshots                                │
└───────────────┬──────────────────────────────┬───────────────────┘
                │                              │
                ▼                              ▼
      Spotify Accounts                 Spotify Web API
      OAuth and tokens                 user data and metadata

GitHub main
  → GitHub Actions
  → Vite production build
  → Cloudflare Worker static assets
  → browser receives HTML, CSS, and JavaScript
```

## Backend terminology

There are three remote services involved, but only one can be described as the
data backend:

| Service | Responsibility |
| --- | --- |
| Spotify Accounts | Authorization Code with PKCE and token refresh |
| Spotify Web API | Top tracks, artists, profile, playlists, and playlist items |
| Cloudflare Workers | Static asset hosting for the compiled SPA |

There is no custom API, server session, database, queue, or server-side token
store in the deployed application.

## Application bootstrap

`src/App.svelte` owns top-level routing between three states:

```text
booting
  ├── valid share hash → decode snapshot → shared dashboard
  ├── OAuth callback → complete token exchange → private dashboard
  ├── saved auth → load Spotify data → private dashboard
  └── no saved auth → connection page
```

The initial `booting` state prevents the connection page from flashing before a
stored session is checked. `src/pages/LoadingPage.svelte` renders during this
phase.

## Page boundaries

```text
src/pages/auth/        Authentication and BYO Spotify setup
src/pages/dashboard/   Listening and playlist dashboard composition
src/pages/LoadingPage  Startup state
src/shell/             Shared page layout and visual header
src/ui/components/     Reusable presentation primitives
```

`App.svelte` selects the page and connects controllers to page callbacks.
Dashboard-specific controls and workspaces remain under `pages/dashboard`.

## State ownership

### Spotify session

`src/features/spotify/session.svelte.ts` owns:

- Selected Spotify app source and Client ID
- Connection status and messages
- Remember-me preference
- OAuth start, callback completion, reconnect, and disconnect actions

### Dashboard

`src/features/dashboard/dashboard.svelte.ts` owns:

- Track, artist, and album selection
- Time range selection
- Listening and playlist dashboard views
- Lazy playlist and playlist-item loading
- Playlist permission and error state

The dashboard model is derived from normalized data rather than stored as a
second source of truth.

## Authentication flow

1. The user chooses their own Spotify app or configured Owner Access.
2. The browser creates a PKCE verifier and challenge.
3. The browser redirects to Spotify Accounts.
4. Spotify returns an authorization code to the registered redirect URI.
5. The browser exchanges the code directly with Spotify’s token endpoint.
6. Tokens are stored in `localStorage` or `sessionStorage`.
7. Expiring access tokens are refreshed through Spotify.

No Client Secret is used. The Spotify Client ID is public, but the refresh token
must remain private to the browser.

## Listening data flow

```text
SpotifyClient
  → GET /me/top/tracks and /me/top/artists for three ranges
  → map Spotify DTOs to normalized Track and Artist models
  → DashboardController stores ListeningData
  → createDashboardModel derives rankings, stats, and insights
  → Svelte components render the model
```

Albums are not fetched from a top-albums endpoint. `src/services/albums.ts`
groups the current top tracks by album and ranks them using ranked-track points.

## Playlist data flow

```text
Dashboard Playlists mode
  → GET /me and GET /me/playlists (paginated)
  → normalize PlaylistSummary
  → user selects a playlist
  → GET /playlists/{id}/items (paginated)
  → normalize playlist tracks
```

Spotify currently permits playlist-item access only for playlists owned by the
current user or playlists where the user is a collaborator. Followed,
non-collaborative playlists remain visible in the library but do not expose
track contents.

## Sharing flow

```text
ListeningData
  → compact v1 snapshot
  → JSON
  → gzip CompressionStream
  → Base64URL
  → URL fragment (#share=...)
```

The fragment is decoded entirely in the browser. Shared snapshots include track
and artist rankings for all three ranges. They exclude OAuth tokens, account
identifiers, and playlist data.

## Download and clipboard flow

CSV and JSON builders return an `ExportFile`. Export actions:

1. Copy the content, stripping the CSV BOM from clipboard text.
2. Trigger a browser download.
3. Report whether both actions succeeded.

If clipboard access is denied, the download still proceeds.

## Runtime profiles

| Command | Data | Authentication |
| --- | --- | --- |
| `npm run dev` | Live Spotify | Real Spotify OAuth |
| `npm run dev:demo` | Synthetic fixtures | Skipped |
| `npm run dev:mock-auth` | Synthetic fixtures | Browser-only mock |

Live and mock paths implement the same `SpotifyClient` interface. UI components
do not know whether data came from Spotify or a fixture.

## Privacy boundaries

- OAuth tokens remain in browser storage.
- The app does not send tokens to Cloudflare.
- Playlist data is available only in the authenticated playlist workspace.
- Shared links never include playlists or account identifiers.
- Ignored local files such as `.env.local`, `.spotify-tokens.json`, and `.data/`
  are not part of the repository or deployment.
