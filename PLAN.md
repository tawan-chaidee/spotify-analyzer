# Spotify Analyzer Execution Plan

## Objective

Ship a recruiter-ready, static Spotify listening dashboard built with minimal
React, TypeScript, Vite, and Tailwind CSS.

The completed product:

- Authenticates with Spotify Authorization Code + PKCE.
- Loads top tracks and artists across all three Spotify time ranges.
- Displays up to 50 ranked items per range.
- Includes movement, statistics, release-year insights, and exports.
- Creates no-login share links without a backend.
- Provides a deterministic fixture-backed demo mode.
- Produces a Cloudflare Pages-ready static deployment.

## Status

Implementation and local verification are complete. Deployment is intentionally
not performed.

### Application

- [x] React, ReactDOM, strict TypeScript, Vite, and Tailwind v4
- [x] Spotify PKCE login with local and production redirect handling
- [x] Persistent and session token storage
- [x] Automatic access-token refresh with one in-flight refresh request
- [x] Top tracks and artists for 4 weeks, 6 months, and 1 year
- [x] Full 50-item rankings
- [x] Track movement comparing 6-month and 1-year rankings
- [x] Top track, top album, statistics, overlap, and release-year insights
- [x] Simplified and complete CSV/JSON exports
- [x] No-login compressed URL-fragment sharing
- [x] Legacy malformed share-link compatibility
- [x] Responsive connection, private dashboard, and shared dashboard states
- [x] Semantic Tailwind theme tokens and reusable UI primitives
- [x] Native semantic HTML without redundant ARIA

### Architecture

- [x] Framework-independent Spotify, model, export, ranking, and sharing code
- [x] Functional `SpotifyClient` boundary shared by live and mock providers
- [x] DI-lite through function composition; no container, classes, or framework
- [x] Typed local content service
- [x] No backend, database, router, state library, or Pages Functions

### Demo data

- [x] Deterministic public Spotify catalog fixture
- [x] 50 tracks and 50 artists for every time range
- [x] Realistic album relationships and ranking movement
- [x] Deterministic generated artwork shared by tracks from the same album
- [x] Public-demo content sanitization
- [x] Personal tokens and local data excluded by `.gitignore`
- [x] Mock assets excluded from live production output

### Verification

- [x] Strict TypeScript checking
- [x] 29 Vitest unit and component tests
- [x] 6 Playwright Chromium tests with intercepted Spotify requests
- [x] Private dashboard and ranking filters
- [x] OAuth request parameters
- [x] CSV download
- [x] Share creation, no-login opening, and malformed-link handling
- [x] Mobile overflow check
- [x] Coverage report with 72.8% statements and 73.0% lines
- [x] Live production build
- [x] Mock production build
- [x] Live build excludes `test-fixtures`
- [x] Mock build includes `test-fixtures`

### Cloudflare Pages readiness

- [x] Static Vite output in `dist/`
- [x] Cloudflare `_headers`
- [x] Favicon and `robots.txt`
- [x] Canonical, Open Graph metadata, and `sitemap.xml` generation from
  `VITE_SITE_URL`
- [x] Public live and mock environment examples
- [x] Cloudflare-compatible Node version guidance
- [x] No Wrangler configuration required for Git-integrated Pages deployment

## Verification Commands

```bash
npm run check
npm run test:e2e
npm run test:coverage
npm run build:mock
```

With a production URL configured:

```bash
VITE_SITE_URL=https://music.example.com/ npm run build
```

Inspect `dist/index.html` for canonical/Open Graph tags and confirm
`dist/sitemap.xml` contains the configured URL.

## Cloudflare Pages Settings

```text
Framework preset: Vite
Build command: npm run build
Output directory: dist
Production branch: main
Node version: 22.16.0
```

Production variables:

```text
VITE_DATA_SOURCE=live
VITE_SPOTIFY_CLIENT_ID=<public-client-id>
VITE_SITE_URL=https://<production-domain>/
```

Preview variables:

```text
VITE_DATA_SOURCE=mock
VITE_SPOTIFY_CLIENT_ID=<public-client-id>
VITE_SITE_URL=https://<preview-domain>/
```

Every `VITE_` value is public. Never configure a Spotify Client Secret.

## External Release Actions

These require account access and are intentionally not executed here:

- [ ] Create the Cloudflare Pages project.
- [ ] Add production and preview environment variables.
- [ ] Attach the production domain.
- [ ] Register the exact production redirect URI in Spotify.
- [ ] Run a real Spotify login, export, and share smoke test after deployment.

## Acceptance Criteria

- The application runs entirely in the browser.
- No Spotify secret or token is committed.
- The live build contains no demo fixtures.
- Mock mode remains available through an explicit build mode.
- Unit, component, and fixture-backed browser tests pass.
- `dist/` can be uploaded to Cloudflare Pages without server configuration.
