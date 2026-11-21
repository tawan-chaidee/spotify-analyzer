# Documentation Guide

Last verified: 2026-11-21 · Application version: 0.4.0

Start with the document that matches the area being changed.

| Task | Read |
| --- | --- |
| Run or configure the app | [README](../README.md) |
| Understand runtime boundaries and data flow | [Architecture](architecture.md) |
| Find where a feature lives | [Feature map](features.md) |
| Change authentication, API requests, or Spotify models | [Spotify integration](spotify-integration.md) |
| Change hosting, environment variables, or CI | [Deployment](deployment.md) |
| Review the BYO Client ID design | [BYO Spotify app](byo-spotify-client-id.md) |
| Review the React-to-Svelte migration | [Svelte migration](svelte-migration.md) |
| Review released changes | [Changelog](../CHANGELOG.md) |

## Architecture in one paragraph

The browser performs Spotify OAuth with PKCE, stores tokens locally, and calls
Spotify Web API endpoints directly. Svelte renders the connection and dashboard
states from normalized TypeScript models. Cloudflare Workers serves the static
Vite build and does not execute application API logic. GitHub Actions builds the
site and deploys it with Wrangler.

## Validation

```text
npm run check       Types, unit/component tests, production build
npm run test:e2e    OAuth, dashboard, playlists, exports, and visual regressions
```

Current automated coverage:

```text
48 unit/component tests
17 Playwright tests
Desktop and mobile visual baselines
```

Tests use synthetic fixtures and never contact Spotify production services.
