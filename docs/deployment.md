# Deployment

Last verified: 2026-11-21 · Application version: 0.5.1

## Deployment model

Spotify Top Explorer builds to static HTML, CSS, and JavaScript. Cloudflare
Workers serves those assets. There is no Worker API entry point, database,
session service, or server-side Spotify token exchange.

```text
GitHub main
  → GitHub Actions
  → npm ci
  → npm run build
  → wrangler deploy
  → Cloudflare Worker static assets
```

Production:

```text
https://spotify-analyzer.tawan-jhaidee.workers.dev/
```

## Local development

```text
npm ci
npm run dev
```

Default local URL:

```text
http://127.0.0.1:8000/
```

Spotify callback:

```text
http://127.0.0.1:8000/callback
```

If the port changes, register the matching callback in the Spotify Developer
Dashboard.

## Runtime profiles

| Command | Application mode | Data | Auth |
| --- | --- | --- | --- |
| `npm run dev` | Live | Spotify Web API | Real PKCE |
| `npm run dev:demo` | Demo | Synthetic fixtures | None |
| `npm run dev:mock-auth` | Mock auth | Synthetic fixtures | Browser mock |

`npm run dev:mock` aliases the fixture demo for backwards compatibility.

## Build output

Vite writes the deployable bundle to:

```text
dist/
```

Live builds remove `test-fixtures/` from the output so production does not ship
the mock Spotify API dataset.

`wrangler.jsonc` configures:

```text
Worker name: spotify-analyzer
Assets directory: ./dist
SPA fallback: enabled
```

## Environment variables

`.env.example` documents the public variables:

```text
VITE_SPOTIFY_CLIENT_ID
VITE_SITE_URL
```

`VITE_SPOTIFY_CLIENT_ID` enables Owner Access. It is a public browser value and
must never contain a Client Secret.

`VITE_SITE_URL` adds canonical metadata, sitemap output, and robots output.

Additional build-time values are defined by `vite.config.ts`:

```text
__APP_MODE__
__AUTH_SOURCE__
__DATA_SOURCE__
```

## GitHub Actions

Workflow:

```text
.github/workflows/deploy.yml
```

Triggers:

- Push to `main`
- Manual workflow dispatch

Required repository secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

Required repository variables:

```text
VITE_SPOTIFY_CLIENT_ID
VITE_SITE_URL
```

The workflow skips deployment with a notice when required values are absent.
This keeps forks buildable without Cloudflare credentials.

## Release validation

Run before pushing a release:

```text
npm run check
npm run test:e2e
```

Expected current coverage:

```text
54 unit/component tests
19 Playwright tests
Production build
Desktop and mobile visual baselines
```

After deployment, verify:

1. The GitHub Actions deployment run succeeds.
2. Production responds with HTTP 200.
3. The deployed OAuth redirect URI is registered in Spotify.
4. Existing users reconnect if new Spotify scopes were introduced.

## Rollback

Revert the production commit on `main` and push the revert. GitHub Actions will
rebuild and deploy the previous application behavior. Spotify data remains in
the browser and is not affected by an application rollback.
