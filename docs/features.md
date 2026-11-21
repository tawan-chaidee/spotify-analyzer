# Feature Map

Last verified: 2026-11-21 · Application version: 0.4.0

This map connects user-visible behavior to implementation and test locations.

| Feature | Current behavior | Primary source | Verification |
| --- | --- | --- | --- |
| Startup bootstrap | Shows a loading page while checking shared data, OAuth callbacks, saved sessions, or logged-out state | `src/App.svelte`, `src/routes/LoadingPage.svelte` | `e2e/app.spec.ts`, `e2e/oauth.spec.ts` |
| BYO Spotify connection | User supplies a public Client ID and authorizes through Spotify PKCE | `src/services/auth.ts`, `src/services/spotify-app.ts`, `src/components/ClientIdSetup.svelte` | `tests/services/auth.test.ts`, `tests/components/client-id-setup.test.ts`, `e2e/oauth.spec.ts` |
| Owner Access | Secondary connection path for the deployment owner’s configured Client ID | `src/features/spotify/session.svelte.ts`, `.env.example` | `e2e/oauth.spec.ts`, `e2e/app.spec.ts` |
| Token lifecycle | Stores browser tokens, refreshes expiring access tokens, and retries an API request after a 401 | `src/services/auth.ts`, `src/api/spotify/client.ts` | `tests/services/auth.test.ts`, `tests/api/spotify/client.test.ts` |
| Track rankings | Top 50 tracks for 4 weeks, 6 months, and 1 year | `src/services/rankings.ts`, `src/services/dashboard.ts`, `src/components/RankingList.svelte` | `tests/services/rankings.test.ts`, `tests/services/dashboard.test.ts`, `e2e/app.spec.ts` |
| Artist rankings | Top 50 artists for all three ranges with six-month versus one-year movement | `src/api/spotify/mappers.ts`, `src/services/dashboard.ts` | `tests/services/dashboard.test.ts`, `e2e/app.spec.ts` |
| Inferred album rankings | Groups top tracks by album and ranks with `Σ (N − track rank + 1)` | `src/services/albums.ts`, `src/services/dashboard.ts`, `src/components/AlbumRankingMethod.svelte` | `tests/services/albums.test.ts`, `tests/services/dashboard.test.ts` |
| Listening spotlights | Shows the top track and top album for the selected range | `src/services/dashboard.ts`, `src/components/SpotlightGrid.svelte` | `tests/services/dashboard.test.ts`, visual tests |
| Listening statistics | Counts unique artists and albums, average duration, and explicit percentage | `src/services/dashboard.ts`, `src/components/StatsGrid.svelte` | `tests/services/dashboard.test.ts`, visual tests |
| Ranking insights | Shows cross-range overlap and release-year distribution for tracks | `src/services/dashboard.ts`, `src/components/InsightsPanel.svelte` | `tests/services/dashboard.test.ts` |
| Playlist library | Loads and paginates the user’s owned and followed playlists | `src/api/spotify/client.ts`, `src/features/dashboard/dashboard.svelte.ts`, `src/components/PlaylistLibrary.svelte` | `tests/api/spotify/client.test.ts`, `e2e/app.spec.ts` |
| Playlist discovery | Search by name or owner, filter All/Owned/Followed, and sort by Spotify order/name/track count | `src/components/PlaylistLibrary.svelte` | `e2e/app.spec.ts` |
| Playlist details | Lazily loads playlist items for owned or collaborative playlists | `src/api/spotify/client.ts`, `src/components/PlaylistLibrary.svelte` | `tests/api/spotify/client.test.ts`, `e2e/app.spec.ts` |
| Playlist permission recovery | Detects missing playlist scopes and offers a reconnect flow that returns to Playlist mode | `src/services/auth.ts`, `src/features/spotify/session.svelte.ts`, `src/App.svelte` | `e2e/app.spec.ts` |
| Ranking exports | Current and complete data as CSV or JSON | `src/services/export.ts`, `src/components/ExportPanel.svelte` | `tests/services/export.test.ts`, `e2e/app.spec.ts` |
| Playlist exports | Playlist-library metadata or selected-playlist tracks as CSV or JSON | `src/services/playlist-export.ts`, `src/components/PlaylistLibrary.svelte` | `e2e/app.spec.ts` |
| Copy plus download | Exports download their file and copy content; clipboard failure does not block download | `src/services/export.ts`, `src/services/clipboard.ts` | `e2e/app.spec.ts` |
| Playlist filenames | Selected-playlist exports preserve the playlist name | `src/services/playlist-export.ts` | `e2e/app.spec.ts` |
| No-login sharing | Compresses track and artist snapshots into a share-safe URL fragment | `src/services/sharing/`, `src/App.svelte` | `tests/services/sharing.test.ts`, `e2e/share.spec.ts` |
| Shared dashboard | Opens the dashboard read-only without Spotify authentication | `src/App.svelte`, `src/routes/DashboardPage.svelte` | `e2e/share.spec.ts` |
| Deterministic demo | Serves synthetic Spotify API data and artwork without credentials | `src/mocks/spotify-client.ts`, `public/test-fixtures/`, `scripts/` | `e2e/app.spec.ts`, `e2e/oauth.spec.ts` |
| Responsive visual system | Shared Svelte components and Spotify-aligned theme for desktop and mobile | `src/components/`, `src/style.css`, `src/ui/styles.ts` | `e2e/visual.spec.ts` |
| Static deployment | Builds with Vite and deploys static assets through Cloudflare Workers | `.github/workflows/deploy.yml`, `wrangler.jsonc` | GitHub Actions production run |

## Shared UI components

Prefer the existing components when extending a feature:

| Component | Use |
| --- | --- |
| `Button.svelte` | Native buttons and external links |
| `Card.svelte` | Bounded visual surfaces |
| `Panel.svelte` | Titled dashboard sections |
| `Selector.svelte` | Small mutually exclusive option groups |
| `InlineFeedback.svelte` | Success, information, warning, and error messages |
| `Artwork.svelte` | Spotify artwork with safe URL handling |
| `StatusBadge.svelte` | Compact status labels |
| `CheckboxField.svelte` | Native checkbox rows |

Typography and shared class helpers live in `src/ui/styles.ts`.

## Important product constraints

- Spotify’s top-items endpoint supports rolling approximate ranges, not calendar
  years.
- The app requests at most 50 top tracks and 50 top artists per range.
- Albums are inferred from top tracks and are not an official Spotify album
  ranking.
- Playlist items are available only for owned or collaborative playlists.
- The app does not create, edit, follow, or delete Spotify playlists.
- Shared snapshots do not include private playlist data.
