# Changelog

## 0.5.0 — 2026-11-21

### Changed

- Separated authentication and dashboard page composition.
- Moved reusable visual primitives into `src/ui/components`.
- Split the dashboard into selectors, listening, and playlist workspaces.
- Broke playlist discovery, details, tracks, and exports into focused
  components.
- Removed the unused legacy application-state model.

## 0.4.1 — 2026-11-21

### Documentation

- Added a root documentation map for AI and contributor navigation.
- Documented runtime architecture, feature ownership, Spotify integration, and
  Cloudflare deployment.
- Refreshed the BYO authentication and Svelte migration records.

### Changed

- Simplified CSV and JSON exports to focus on ranking names, artists, albums,
  and playlist metadata instead of internal Spotify IDs, images, links, and
  technical flags.

## 0.4.0 — 2026-11-21

### Added

- A startup loading state that resolves saved authentication before showing
  either the connection page or dashboard.
- CSV and JSON export actions now copy their contents to the clipboard while
  retaining the file download.

## 0.3.0 — 2026-11-05

### Added

- A dedicated Playlist library mode alongside the listening dashboard.
- Search, ownership filters, and sorting for owned and followed playlists.
- Lazy playlist track loading with CSV and JSON exports.
- Clear reauthorization handling when existing Spotify sessions do not yet have
  playlist permissions.

## 0.2.0 — 2026-11-05

### Added

- Inferred album rankings derived from top-track data.
- Album ranking methodology and coverage disclosure in the dashboard.
- Album movement comparisons between six-month and one-year rankings.
- CSV and JSON exports for the current inferred album ranking.
- Artist ranking movement between six-month and one-year rankings.

### Changed

- Refreshed the interface with Spotify-aligned spacing, surfaces, controls,
  typography, and green accent treatment.
- Replaced the previous background bloom with layered wave artwork.
- Updated visual regression baselines for the revised dashboard.

### Fixed

- Mock artist rankings now contain unique artists and demonstrate realistic
  up, down, stable, and new movement states.
