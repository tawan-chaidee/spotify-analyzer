# Testing Strategy

## Goals

The suite protects the behaviors users depend on:

- Spotify Authorization Code with PKCE
- Token storage and refresh
- Top-track and top-artist loading
- Ranking, movement, and dashboard calculations
- CSV and JSON exports
- Backend-free compressed sharing
- Private and shared dashboard rendering
- Responsive mobile behavior

Tests are deterministic, automated, and independent of the real Spotify
service.

## Stack

| Purpose | Tool |
|---|---|
| Static checks | TypeScript `tsc --noEmit` |
| Unit and service tests | Vitest |
| Component tests | Vitest, happy-dom, React Testing Library |
| User interaction | `@testing-library/user-event` |
| Browser tests | Playwright Chromium |
| Coverage reporting | `@vitest/coverage-v8` |

React Testing Library runs inside Vitest. It is not a separate test runner.

## Current Status

Implemented:

- Strict type checking
- 29 Vitest unit and component tests
- 6 Playwright browser tests
- Fixture-backed Spotify request interception
- Private dashboard and filter tests
- OAuth authorization request test
- CSV download test
- Share creation and malformed-link tests
- Mobile overflow test
- Live and mock production build checks
- A coverage report currently at 72.8% statements and 73.0% lines

Intentionally outside the suite:

- Real Spotify accounts or consent screens
- Manual release checks
- ARIA implementation assertions
- Axe scans
- WebKit or Firefox jobs
- Screenshot regression baselines
- Strict global coverage thresholds

## Test Layers

### Static

`npm run typecheck` checks application, test, and configuration types.

`npm run build` additionally verifies the live production bundling path.

### Unit and service

Vitest tests services and transforms without React or the real network:

- Spotify DTO mapping
- Dashboard statistics and ranking movement
- Current and complete CSV/JSON exports
- Share compaction, compression, compatibility, and validation
- Safe URL handling
- Redirect URI rules, concurrent token refresh, and rejected refresh handling
- Six-request ranking orchestration

Inject the functional `SpotifyClient` boundary when a test needs Spotify data.
Do not contact Spotify.

### Components

Component tests are intentionally small. They verify isolated branches that are
faster to cover here than through a full browser journey:

- Button activation and disabled behavior
- Connection loading and error states
- Ranking-row trend text, safe links, and artwork fallback
- Selector callback behavior

Use visible text, roles, and user interactions. Do not assert implementation
details, ARIA attributes, or broad HTML snapshots.

### Browser

Playwright uses Chromium and the real live-client path:

```text
seeded token
  → real SpotifyClient
  → intercepted Spotify response fixture
  → real mapper
  → real React pages
```

The browser suite covers:

- OAuth URL, scope, PKCE parameters, and local redirect URI
- Private dashboard loading
- Track/artist and time-range switching
- 50 rendered ranking rows
- CSV download
- Share creation and no-login opening
- Malformed share-link handling
- Mobile layout without horizontal overflow

Playwright does not log in to Spotify, use application mock mode for its main
journeys, or make unexpected external requests.

## Fixtures

Fixtures are separated by boundary:

```text
tests/fixtures/
├── listening.ts       # normalized application data
├── spotify-api.ts     # typed raw Spotify response import
└── spotify-catalog.json

public/test-fixtures/
├── spotify-api.json   # deterministic API response catalog
├── art-*.svg          # artist artwork
└── covers/            # one generated cover per album
```

The canonical fixture includes:

- 50 tracks and 50 artists in every range
- Real public song and album metadata
- The approved Mitski, Laufey, Phoebe Bridgers, Radiohead, Lana Del Rey,
  girl in red, and Clairo artist mix
- Balanced up, down, new, and stable movement
- Multiple artists, repeated albums, explicit tracks, and varied release years
- One shared deterministic SVG cover per album
- Sanitized public-demo titles

Regenerate the fixture and artwork:

```bash
npm run mock:fixture
```

Personal listening captures, tokens, exports, and local data must remain under
ignored paths and never be committed.

## Commands

```bash
npm run typecheck
npm test
npm run test:watch
npm run test:coverage
npm run test:e2e
npm run build
npm run build:mock
npm run check
```

`npm run check` runs type checking, Vitest, and the live production build.
Browser tests are a separate command so they can start a local Playwright web
server.

## CI Recommendation

Run this on pull requests:

```bash
npm ci
npm run check
npx playwright install --with-deps chromium
npm run test:e2e
npm run build:mock
```

Cache `node_modules` through the setup action rather than committing it. Use
the lockfile for deterministic installs.

CI must not receive Spotify credentials or personal listening data.

## Release Gate

Before deployment:

1. Run `npm run check`.
2. Run `npm run test:e2e`.
3. Run `npm run build:mock`.
4. Build once with the production `VITE_SITE_URL`.
5. Confirm the live output excludes `dist/test-fixtures`.
6. Confirm metadata, sitemap, and the Spotify redirect URI match production.

After deployment, perform the single real-service smoke test that automated
tests intentionally cannot cover: Spotify login, ranking load, export, and a
share link opened in a private browser window.

## Definition of Done

- Type checking and production builds pass.
- All unit, service, and component tests pass.
- Fixture-backed browser tests pass.
- Private and shared paths are covered.
- No automated test requires the real Spotify service.
- No credential, token, or personal listening fixture is committed.
