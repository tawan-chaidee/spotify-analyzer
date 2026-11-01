# Architecture

## Decision

Spotify Top Explorer is a static React application with a small TypeScript
service layer and no application server.

```text
React pages and components
  → framework-independent services and models
  → functional SpotifyClient boundary
      → live Spotify Web API client
      → deterministic fixture client
```

The same dashboard path handles private Spotify data, local demo data, and
no-login shared data.

## Why Static

The core product only needs:

- Browser redirects for Spotify OAuth
- Browser requests to the Spotify Web API
- Local ranking and export calculations
- URL-based snapshot sharing

A backend would add deployment, secret-management, storage, abuse, and privacy
work without improving the initial user experience.

Cloudflare Pages can serve the produced static assets from its CDN. No Pages
Function or Worker is invoked at runtime.

## Why Minimal React

React provides a clear component model for the dashboard's selected type, range,
shared/private mode, loading state, and export panel.

The project deliberately avoids:

- Next.js or another meta-framework
- A router for a two-page flow
- A state-management library for one application state owner
- A component library for a small custom visual system
- A DI container for one provider boundary

The production bundle is a tradeoff: React adds JavaScript, while React's
component model keeps the view code easier to review and maintain. It does not
change Cloudflare static-asset pricing.

## Layer Boundaries

### API

`SpotifyClient` is the only Spotify boundary:

```ts
interface SpotifyClient {
  getTopTracks(range: TimeRange, limit: number): Promise<Track[]>;
  getTopArtists(range: TimeRange, limit: number): Promise<Artist[]>;
}
```

The live implementation owns HTTP, bearer headers, response parsing, one refresh
retry, and Spotify error messages. The mock implementation returns fixture data
through the same contract.

Raw Spotify DTOs are mapped into normalized application models before reaching
services or components.

### Services

Services are plain TypeScript functions. They own:

- PKCE and token lifecycle
- Loading all rankings
- Dashboard transformations
- CSV/JSON serialization
- Share compaction, compression, validation, and parsing

Services do not import React.

### React

Pages own application flow. Components render typed data and emit callbacks.
They do not call Spotify, access token storage, encode share links, or compute
dashboard statistics.

This keeps most behavior testable in Vitest without a DOM or browser.

## Spotify Authentication

Authorization Code with PKCE is the correct OAuth flow for a public browser
client:

- No Client Secret is shipped.
- Spotify's exact redirect URI must be registered.
- Local HTTP development is limited to `127.0.0.1`.
- `localhost` and other HTTP hosts are rejected.
- Production redirects require HTTPS.
- Access and refresh tokens remain in browser storage.
- Share snapshots never include tokens.

The requested scope is only `user-top-read`.

The application refreshes access tokens within 60 seconds of expiry. A module
level, single in-flight promise prevents concurrent loads from starting
duplicate refresh requests.

## Sharing

Snapshot sharing avoids a backend:

```text
ListeningData
  → compact versioned snapshot
  → JSON
  → gzip
  → Base64URL
  → #share=...
```

The fragment is not sent in the HTTP request. A recipient's browser expands the
snapshot into the regular dashboard model.

The accepted constraints are unrevocable links, long URLs, generic previews, and
dependence on browser compression streams.

Short links, expiration, and revocation would require a storage service and are
outside this product boundary.

## Mock Mode

`VITE_DATA_SOURCE=mock` selects a deterministic fixture client during the build.

Mock mode:

- Exercises the same mapper and dashboard services as live mode.
- Requires no Spotify account.
- Supports preview deployments.
- Uses 50 items per range.
- Uses a generated local cover per album.
- Contains only sanitized public-demo content.
- Is absent from the live production bundle.

Playwright separately intercepts Spotify HTTP requests. That verifies the live
client path without using application mock mode or contacting Spotify.

## Testing

```text
TypeScript
  └── source, tests, and configuration

Vitest / Node
  └── URL safety, mappers, dashboard, exports, sharing, auth helpers

Vitest / happy-dom
  └── focused React component behavior

Playwright / Chromium
  └── fixture-backed private, OAuth, share, and mobile journeys
```

Unit tests dominate because most product risk lives in transformations and
provider boundaries. Component tests cover isolated states that are cheap to
verify. Playwright covers complete flows without duplicating every branch.

The suite intentionally excludes real Spotify behavior, manual checks, ARIA
implementation assertions, axe scans, broad screenshots, and cross-browser
matrices.

See [TESTING.md](TESTING.md) for the exact coverage.

## Styling

Tailwind v4 is configured through semantic theme tokens:

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

Components use inline Tailwind utilities and semantic colors. Repeated patterns
become small primitives such as `Card`, `Button`, `Selector`, `Artwork`, and
`RankingRow`.

The current product has one dark theme. Runtime theme switching is not justified
yet.

## Cloudflare Pages

```text
Build command: npm run build
Output directory: dist
Production branch: main
```

Production uses live Spotify data. Preview deployments use mock mode because
their generated hostnames cannot all be registered as exact Spotify redirects.

The production environment supplies:

```text
VITE_DATA_SOURCE=live
VITE_SPOTIFY_CLIENT_ID=<public-client-id>
VITE_SITE_URL=https://<production-domain>/
```

A valid `VITE_SITE_URL` adds canonical/Open Graph metadata and emits
`sitemap.xml`. `public/_headers` applies security and caching headers through
Cloudflare.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the release configuration.

## Cost Model

The browser application performs six top-item requests when the dashboard first
loads:

```text
tracks × 3 ranges
artists × 3 ranges
```

This is well within the product's intended personal and portfolio usage.
Cloudflare static asset requests are not billed per request. Spotify Web API
access is constrained by app quota modes and rate limits, not per-call billing.

Spotify currently limits development-mode applications to a small allowlist of
users. Wider public access requires appropriate Spotify review or quota mode.

## Security Requirements

- Never ship a Spotify Client Secret.
- Never include tokens in share snapshots.
- Treat every `VITE_` value as public.
- Use HTTPS for production OAuth.
- Use `127.0.0.1` rather than `localhost` for local OAuth.
- Validate external URLs before rendering them.
- Keep personal captures out of Git.
- Keep the production bundle free of demo fixtures.
