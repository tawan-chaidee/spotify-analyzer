# Spotify Top Explorer

Turn your Spotify top tracks and artists into rankings you can compare,
export, and share.

Spotify Top Explorer is a static listening-insights app built with React and
TypeScript. It loads all three available Spotify time ranges, shows movement
against the yearly ranking, exports CSV or JSON, and creates read-only share
links that recipients can open without Spotify access.

[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

> Cloudflare Pages deployment and a live demo link will be added after release.

## Features

- Spotify Authorization Code with PKCE and automatic token refresh
- Top 50 tracks and artists for 4 weeks, 6 months, and 1 year
- Six-month movement compared with the yearly track ranking
- Top-track, top-album, listening-stat, overlap, and release-year insights
- Current-ranking and complete CSV/JSON exports
- No-login sharing through compressed URL fragments
- A deterministic 50-item demo that requires no Spotify account
- Static Cloudflare Pages deployment with no backend or database

## Try the demo

Run the fixture-backed demo without Spotify credentials:

```bash
npm ci
npm run dev:mock
```

Open [http://127.0.0.1:8000/](http://127.0.0.1:8000/).

## Run with Spotify

1. Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Add this redirect URI exactly:

   ```text
   http://127.0.0.1:8000/callback
   ```

3. Create `.env.development`:

   ```text
   VITE_DATA_SOURCE=live
   VITE_SPOTIFY_CLIENT_ID=<your-public-client-id>
   VITE_SITE_URL=http://127.0.0.1:8000/
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

The Spotify Client ID is public. This project does not use a Client Secret.

## How it works

```text
Spotify OAuth
  → Spotify Web API
  → normalized TypeScript models
  → rankings and dashboard insights
  → exports or compressed share links
```

Live and mock data implement the same `SpotifyClient` boundary. React handles
presentation; authentication, API access, ranking calculations, exports, and
sharing remain framework-independent services.

## Quality checks

```bash
npm run check
npm run test:e2e
npm run test:coverage
```

The project currently has 29 passing unit/component tests and 6 fixture-backed
Playwright journeys. Automated tests never contact Spotify.

## Production

```bash
npm run build
```

Cloudflare Pages settings:

```text
Build command: npm run build
Output directory: dist
Node version: 22.16.0
```

Production variables:

```text
VITE_DATA_SOURCE=live
VITE_SPOTIFY_CLIENT_ID=<public-client-id>
VITE_SITE_URL=https://your-production-domain/
```

## Privacy

OAuth tokens stay in the visitor's browser. Share snapshots never include
tokens or Spotify account identifiers, and personal fixtures remain excluded
from Git.
