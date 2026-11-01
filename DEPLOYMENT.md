# Cloudflare Pages Deployment

## Architecture

Spotify Top Explorer is a static single-page application. No backend, database,
Pages Function, or Worker is required.

```text
Browser
  → Cloudflare Pages CDN
  → HTML, CSS, JavaScript, metadata
  → Spotify Accounts and Web API directly
```

Spotify authentication uses Authorization Code with PKCE. Tokens stay in the
visitor's browser. Share snapshots are compressed into the URL fragment, which
is not sent to Cloudflare.

## Build

Cloudflare builds the project from source. Visitors receive only the generated
static files.

```text
Git repository
  → npm ci
  → TypeScript check
  → Vite and Tailwind production build
  → dist/
  → Cloudflare Pages CDN
```

Use these Pages settings:

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Production branch: main
Node version: 22.16.0
```

The repository pins `22.16.0` in `.node-version`. Set the same value through the
Pages `NODE_VERSION` environment variable if the project-level setting is not
applied automatically.

`npm run build` performs:

```text
tsc --noEmit && vite build
```

TypeScript runs during the build only. The browser receives compiled JavaScript.

## Environment Variables

All `VITE_` values are embedded into the public client bundle. Never put a
Spotify Client Secret, access token, refresh token, or private credential in a
`VITE_` variable.

### Production

```text
VITE_DATA_SOURCE=live
VITE_SPOTIFY_CLIENT_ID=<public-client-id>
VITE_SITE_URL=https://<production-domain>/
NODE_VERSION=22.16.0
```

### Preview

```text
VITE_DATA_SOURCE=mock
VITE_SPOTIFY_CLIENT_ID=<public-client-id>
VITE_SITE_URL=https://<preview-domain>/
NODE_VERSION=22.16.0
```

Mock previews do not require Spotify OAuth. Preview origins change for every
deployment, while Spotify redirect URIs must match exactly.

Changing a `VITE_` value requires a new build.

## Production Output

The live build produces:

```text
dist/
├── _headers
├── assets/
├── favicon.svg
├── index.html
├── robots.txt
└── sitemap.xml        # when VITE_SITE_URL is set
```

The live build intentionally excludes `public/test-fixtures/`.

The mock build includes the fixture bundle so the public demo works without
Spotify authentication.

## Metadata

When `VITE_SITE_URL` is a valid HTTP or HTTPS URL, the Vite build:

- Adds canonical, Open Graph title, description, type, and URL tags.
- Generates `sitemap.xml` containing the configured site root.
- Adds the sitemap location to `robots.txt`.

Set the production value to the final custom domain, including the trailing
slash. Do not use a preview hostname for production metadata.

## Spotify Redirect URI

Spotify requires an exact redirect URI match.

Local development:

```text
http://127.0.0.1:8000/callback
```

Cloudflare production:

```text
https://<production-domain>/
```

Register both URLs in the Spotify Developer Dashboard. Do not register
`localhost`, a `file://` URL, or generated preview hostnames.

## Headers and Caching

[`public/_headers`](public/_headers) is copied into `dist/` and applied by
Cloudflare Pages.

The deployed policy:

- Prevents MIME sniffing and framing.
- Restricts camera, microphone, and geolocation access.
- Allows Spotify API and artwork origins required by the app.
- Caches hashed assets immutably.
- Revalidates HTML so deployments become visible promptly.

The root page is the only application path. Share links use the fragment:

```text
https://<production-domain>/#share=...
```

No `_redirects` or catch-all SPA rewrite is required.

## First Deployment

1. Push the repository to GitHub.
2. Create a Cloudflare Pages project from the repository.
3. Apply the build settings above.
4. Add the production and preview environment variables.
5. Deploy once through the generated `*.pages.dev` hostname.
6. Attach the final custom domain.
7. Register the exact production redirect URI in Spotify.
8. Test login, rankings, exports, and a no-login share link.

Keep the preview environment in mock mode. Use a separate, explicitly
registered staging domain only if real Spotify OAuth must be tested before
production.

## Release Checks

```bash
npm run check
npm run test:e2e
npm run build:mock
VITE_SITE_URL=https://<production-domain>/ npm run build
```

Before publishing, confirm:

- The production build contains no `test-fixtures`.
- The mock build contains the fixture data and artwork.
- `dist/index.html` has the expected production canonical URL.
- `dist/sitemap.xml` contains the same URL.
- The Spotify redirect URI matches the custom domain exactly.
- A real login, export, and share link work after deployment.
