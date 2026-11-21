# Repository Documentation Map

This file is an index, not a ruleset.

Spotify Top Explorer is a static Svelte 5 single-page application that reads
Spotify data directly from the browser. Cloudflare serves the built assets;
there is no application backend or production database.

## Start here

| Topic | Document |
| --- | --- |
| Human setup and usage | [README.md](README.md) |
| Documentation guide | [docs/README.md](docs/README.md) |
| Runtime and system architecture | [docs/architecture.md](docs/architecture.md) |
| Feature-to-code map | [docs/features.md](docs/features.md) |
| Spotify auth, endpoints, and models | [docs/spotify-integration.md](docs/spotify-integration.md) |
| Cloudflare and GitHub Actions | [docs/deployment.md](docs/deployment.md) |
| Bring-your-own Spotify app design | [docs/byo-spotify-client-id.md](docs/byo-spotify-client-id.md) |
| Svelte migration history | [docs/svelte-migration.md](docs/svelte-migration.md) |
| Release history | [CHANGELOG.md](CHANGELOG.md) |

## Quick commands

```text
npm ci                 Install dependencies
npm run dev            Live Spotify data and real OAuth
npm run dev:demo       Fixture data without authentication
npm run dev:mock-auth  Fixture auth and fixture data
npm run check          Typecheck, unit tests, and production build
npm run test:e2e       Playwright browser tests
npm run build          Production build
```

## Primary source locations

```text
src/App.svelte                         Application bootstrap and page orchestration
src/routes/                            Top-level pages
src/components/                        Reusable dashboard UI
src/features/spotify/                  Spotify connection state
src/features/dashboard/                Dashboard and playlist state
src/api/spotify/                       Spotify HTTP client, DTOs, and mappers
src/models/                            Normalized application models
src/services/                          Auth, ranking, export, sharing, and content logic
src/mocks/ and public/test-fixtures/   Deterministic local data
e2e/                                   Browser and visual regression tests
```

## Runtime fact

```text
Browser
  → Spotify Accounts for OAuth
  → Spotify Web API for user data
Cloudflare Worker
  → Static assets from dist/
GitHub Actions
  → Builds and deploys the static bundle
```
