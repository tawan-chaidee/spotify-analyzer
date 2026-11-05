# Changelog

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
