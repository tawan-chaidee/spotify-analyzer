# Implementation Details

## Product

Spotify Top Explorer is a static listening-insights application. A visitor
authenticates with Spotify, loads their top tracks and artists, compares
rankings, exports the data, and can share a read-only snapshot without asking
the recipient to log in.

The complete runtime is a browser application. There is no backend, database,
router, remote share store, or secret-bearing Spotify proxy.

## Locked Decisions

- Minimal React and ReactDOM for the view layer
- Strict TypeScript
- Vite for development and production builds
- Tailwind CSS v4 with inline utilities
- Semantic theme tokens instead of raw component colors
- Framework-independent services and models
- One functional `SpotifyClient` boundary shared by live and mock providers
- DI-lite through function composition
- Authorization Code with PKCE
- Compressed URL-fragment sharing
- Explicit `VITE_DATA_SOURCE=live|mock`
- Vitest for unit/component tests
- Playwright Chromium for fixture-backed browser tests
- Cloudflare Pages static hosting

No Next.js, class-based services, DI container, state library, component
library, or Pages Function is required.

## Runtime Flow

```text
main.tsx
  → App
      → shared hash?          → decode snapshot → shared dashboard
      → mock build?           → mock SpotifyClient → dashboard
      → OAuth callback?       → exchange PKCE code → dashboard
      → stored token?         → live SpotifyClient → dashboard
      → otherwise             → connection page
```

The dashboard model is built from normalized listening data. It does not care
whether that data came from Spotify, the fixture provider, or a share link.

## Source Structure

```text
src/
├── api/
│   └── spotify/
│       ├── client.ts       # SpotifyClient contract and HTTP implementation
│       ├── mappers.ts      # Raw DTOs to application models
│       └── types.ts        # Spotify response types
├── components/
│   ├── app-header.tsx
│   ├── artwork.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── connection-card.tsx
│   ├── dashboard-header.tsx
│   ├── export-panel.tsx
│   ├── insights-panel.tsx
│   ├── ranking-controls.tsx
│   ├── ranking-list.tsx
│   ├── ranking-row.tsx
│   ├── selector.tsx
│   ├── spotlight-grid.tsx
│   └── stats-grid.tsx
├── mocks/
│   └── spotify-client.ts
├── models/
│   ├── app.ts
│   ├── auth.ts
│   ├── dashboard.ts
│   ├── listening.ts
│   └── share.ts
├── pages/
│   ├── connection-page.tsx
│   └── dashboard-page.tsx
├── services/
│   ├── auth.ts
│   ├── content.ts
│   ├── dashboard.ts
│   ├── export.ts
│   ├── rankings.ts
│   └── sharing/
│       ├── codec.ts
│       ├── share.ts
│       └── snapshot.ts
├── utils/
│   ├── cn.ts
│   ├── format.ts
│   └── url.ts
├── app.tsx
├── main.tsx
├── style.css
└── vite-env.d.ts
```

## Layer Responsibilities

### Spotify API

`api/spotify/client.ts` owns:

- The Spotify API base URL
- Bearer authorization
- Top-track and top-artist requests
- One forced refresh and retry after `401`
- Spotify API and rate-limit errors

`api/spotify/mappers.ts` converts raw Spotify DTOs into normalized `Track` and
`Artist` models. Components never receive Spotify field names such as
`duration_ms` or `external_urls`.

### Models

- `models/listening.ts` defines normalized tracks, artists, ranges, ranking
  rows, and trend values.
- `models/dashboard.ts` defines the presentation model used by the dashboard.
- `models/auth.ts` defines the versioned browser token record.
- `models/share.ts` defines the compact share snapshot version.
- `models/app.ts` defines page and dashboard modes.

### Services

- `auth.ts` owns PKCE, token exchange, persistence, refresh, and logout.
- `rankings.ts` loads tracks and artists for all three ranges in parallel.
- `dashboard.ts` builds spotlights, statistics, trend movement, overlap, release
  years, and export metadata.
- `export.ts` produces simplified and complete CSV/JSON files.
- `sharing/*` compacts listening data, gzip-compresses it, encodes it as
  Base64URL, and parses shared fragments.
- `content.ts` contains fixed UI copy and copy-formatting helpers.

The services do not import React.

### Pages and Components

`App` owns application state and provider selection. The connection and
dashboard pages are separate view boundaries.

Shared primitives:

| Primitive | Responsibility |
|---|---|
| `Card` | Repeated bordered dashboard surface |
| `Button` / `ButtonLink` | Shared action sizing, variants, focus, and disabled states |
| `Selector` | Mutually exclusive native-button choices |
| `Artwork` | Safe artwork URL and deterministic fallback |
| `RankingRow` | Ranked track/artist presentation and movement |

Feature components compose those primitives. They do not call Spotify, read
authentication storage, or calculate application statistics.

## Authentication

The browser uses Spotify Authorization Code with PKCE:

- Scope: `user-top-read`
- No Client Secret
- State and verifier stored temporarily in `sessionStorage`
- Persistent login stored in `localStorage`
- Session-only login stored in `sessionStorage`
- Access token refreshed within 60 seconds of expiry
- Concurrent requests share one in-flight refresh promise
- Invalid refresh clears stored authentication

Local redirect:

```text
http://127.0.0.1:8000/callback
```

Production redirect:

```text
https://<production-domain>/
```

Opening the application through `file://` is unsupported because Spotify
requires an HTTP or HTTPS redirect.

## Dashboard Data

The live and mock clients both return:

```ts
interface ListeningData {
  tracks: Record<TimeRange, Track[]>;
  artists: Record<TimeRange, Artist[]>;
}
```

The dashboard uses:

- 50-item track and artist rankings
- Top track and most represented album spotlights
- Ranked-track, unique-artist, unique-album, duration, and explicit statistics
- Items shared by all three ranges
- Release-year distribution
- Six-month movement compared with the one-year track ranking

The movement comparison is shown only for six-month tracks. This avoids mixing
short-term volatility into the annual comparison.

## Sharing

Share links use:

```text
https://<site>/#share=gz.<base64url-payload>
```

Creation keeps only fields required to render and export the dashboard,
compresses the JSON with gzip, encodes it as Base64URL, and copies the URL.

Opening checks the fragment before authentication. Invalid, oversized, damaged,
or unsupported payloads show an error instead of falling through to login.

Tradeoffs:

- Links cannot be revoked or expired.
- Long rankings produce long URLs.
- Link previews are generic.
- Browsers must support `CompressionStream` and `DecompressionStream`.

These tradeoffs avoid server storage for the initial product.

## Mock Mode

`VITE_DATA_SOURCE=mock` selects `createMockSpotifyClient()` at the composition
root.

The mock catalog stores realistic raw Spotify response shapes and passes through
the same mapper and dashboard model path as live mode. It includes 50 items per
range, deterministic movement, sanitized public song metadata, and one
generated SVG cover per album.

The live build excludes the fixture directory. The explicit mock build includes
it for local demos and Cloudflare preview deployments.

## Theme

Tailwind v4 theme values are defined in `src/style.css`:

```text
main
secondary
highlight
on-highlight
foreground
muted
line
danger
info
```

Components use semantic utilities such as `bg-secondary`, `text-muted`, and
`border-line`. Raw colors remain in the theme definition. Repeated surface,
action, artwork, selector, and ranking-row behavior is extracted into reusable
components rather than custom CSS classes.

## Native Semantics

The UI uses:

- A document `header`
- One `main`
- `section` elements for page regions
- Native `h1`, `h2`, `p`, `ol`, and `li`
- Native buttons and links
- A labelled selector group with pressed-button state
- Visible focus styles and minimum touch-target sizing

The implementation avoids redundant roles when the native element already
communicates the same semantics.

## Configuration

Development:

```text
VITE_DATA_SOURCE=live
VITE_SPOTIFY_CLIENT_ID=<public-client-id>
VITE_SITE_URL=http://127.0.0.1:8000/
```

Mock:

```text
VITE_DATA_SOURCE=mock
VITE_SITE_URL=http://127.0.0.1:8000/
```

Production:

```text
VITE_DATA_SOURCE=live
VITE_SPOTIFY_CLIENT_ID=<public-client-id>
VITE_SITE_URL=https://<production-domain>/
```

The Spotify Client ID is public. A Spotify Client Secret must never be added.

## Deployment Metadata

During a production build, a valid `VITE_SITE_URL`:

- Adds canonical and Open Graph metadata.
- Generates `dist/sitemap.xml`.
- Adds the sitemap location to `robots.txt`.

Cloudflare-specific headers and robots metadata live in `public/`.

See [DEPLOYMENT.md](DEPLOYMENT.md) for Pages settings and release checks.

## Testing

The exact coverage and fixture policy live in [TESTING.md](TESTING.md).

The current suite contains 29 Vitest checks and 6 Playwright journeys. Browser
tests use a seeded token and intercepted Spotify responses, so they exercise the
real live-client path without contacting Spotify.

## Deliberate Exclusions

- No server-side token exchange
- No database or short-link service
- No Spotify Secret
- No analytics, ads, or tracking
- No PWA/service worker
- No light theme
- No generated share previews
- No crawlable per-user pages
