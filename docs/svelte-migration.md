# Svelte Migration

Status: Implemented on `migration/svelte`

## Scope

The frontend was migrated from React 19 to Svelte 5 while preserving the Vite,
TypeScript, Tailwind CSS, Cloudflare Workers, Spotify API, ranking, export, and
sharing layers.

SvelteKit was intentionally not introduced. The application remains a static
single-page application.

## Before and after

```text
Before: React + TypeScript + Vite + Tailwind
After:  Svelte 5 + TypeScript + Vite + Tailwind
```

Production JavaScript changed from approximately 82 KB gzipped to approximately
33 KB gzipped.

## Reusable UI

```text
src/components/Button.svelte
src/components/Card.svelte
src/components/Panel.svelte
src/components/CheckboxField.svelte
src/components/InlineFeedback.svelte
src/components/StatusBadge.svelte
src/components/Artwork.svelte
src/components/Selector.svelte
src/ui/styles.ts
```

`Button.svelte` handles both native buttons and links while preserving the
correct semantic element.

Small uppercase contextual text uses the shared `smallLabelClass` style rather
than a dedicated component.

## State ownership

Authentication and Spotify app selection:

```text
src/features/spotify/session.svelte.ts
```

Dashboard data, selection, loading, and derived model:

```text
src/features/dashboard/dashboard.svelte.ts
```

These controllers keep orchestration out of the root component without
introducing a global store.

## Runtime profiles

```text
npm run dev             live Spotify data + real OAuth
npm run dev:demo        fixture data + no authentication
npm run dev:mock-auth   fixture data + mocked BYO/Owner authentication
```

Remember Me defaults off in mock-auth, so fresh tabs return to onboarding while
the connected tab keeps its session.

## Tests

Framework-independent API, service, model, export, and sharing tests remain in
place.

React component tests were converted to Svelte Testing Library:

```text
tests/components/button.test.ts
tests/components/client-id-setup.test.ts
tests/components/connection-card.test.ts
tests/components/ranking-row.test.ts
tests/components/selector.test.ts
```

The same 12 Playwright journeys cover:

- Visitor Client ID authorization
- Owner Access
- Mocked OAuth callback
- Dashboard filters
- CSV downloads
- Sharing
- Invalid share links
- 403 recovery
- Spotify app switching
- Desktop and mobile layouts

## Verification

Required checks:

```bash
npm run check
npm run build:demo
npm run test:e2e
```

Current status:

- 41 unit/component tests passing
- 12 Playwright tests passing
- Svelte check passes with no diagnostics
- Production build passes
- Demo build passes
- Desktop and mobile visual baselines verified

## Rollback

The pre-migration React implementation is preserved by the local `pre-svelte`
tag. The migration remains isolated on `migration/svelte` until it is reviewed
and merged.
