# Bring Your Own Spotify App

Status: Implemented on feature branch
Branch: `feature/byo-spotify-client-id`
Last updated: 2026-11-02

## Summary

Change the default authentication flow so visitors can use their own Spotify
Developer Client ID with the hosted application. This removes the need to fork,
deploy, or share the owner's limited Spotify allowlist.

The dashboard, exports, and shared snapshots remain unchanged. Only the source
of the Spotify Client ID changes.

## Problem

The current build uses one public Client ID configured through
`VITE_SPOTIFY_CLIENT_ID`.

Spotify apps in development mode can only use a small allowlist of
authenticated users. A public visitor who is not on that allowlist reaches
Spotify login but cannot load their data. Asking every visitor to fork and
deploy the project is too much work.

## Goals

- Make the public path self-service with no deployment required.
- Let a visitor use their own Spotify app and independent development quota.
- Keep Owner Access available for the deployed app owner and approved testers.
- Preserve the existing dashboard, sharing, exports, and mock demo.
- Keep all credentials and OAuth tokens in the visitor's browser.
- Avoid introducing a backend, database, or additional hosting service.

## Non-goals

- Applying for Spotify Extended Quota Mode.
- Importing Spotify streaming-history exports.
- Creating a multi-tenant authentication service.
- Storing Spotify tokens on a server.
- Automating Spotify Developer Dashboard forms.

## User-facing model

Use two authentication paths. Do not expose internal mode numbers.

### Default: Use Your Spotify App

This is the first path shown to every visitor.

Purpose:

- Uses a Client ID supplied by the visitor.
- Gives each visitor their own Spotify application and quota.
- Requires no fork, deployment, or local development setup.

Primary action:

```text
Use Your Spotify App
```

### Secondary: Owner Access

This is available only when the deployment has a configured Client ID.

Purpose:

- Uses the deployment owner's `VITE_SPOTIFY_CLIENT_ID`.
- Is intended for the owner and explicitly allowlisted testers.
- Must not be presented as a public connection option.

Primary action:

```text
Owner Access
```

Supporting text:

```text
For the deployment owner and approved Spotify accounts.
```

### Not authentication modes

These remain separate entry points:

- Explore demo
- View a shared taste profile
- Self-host this project

Self-hosting changes where the app is deployed. It is not an in-app auth mode.

## Terminology

User-facing:

```text
Use Your Spotify App
Owner Access
```

Internal:

```text
source: "own" | "owner"
```

Avoid these labels:

- Normal mode
- Quick Connect
- Public access
- BYO
- Managed connection

They either imply unrestricted access or expose implementation jargon.

## First-run experience

When no active Spotify identity or token exists, show the setup experience.

### Desktop wireframe

```text
┌────────────────────────────────────────────────────────────┐
│ Use your Spotify App                                       │
│                                                            │
│ You only need to do this once.                              │
│ No downloading, coding, or deployment is required.          │
│                                                            │
│ 1  Create a Spotify app                                    │
│    [ Open Spotify Developer Dashboard ]                    │
│                                                            │
│ 2  Add this redirect URI                                   │
│    https://...workers.dev/                  [ Copy ]       │
│                                                            │
│ 3  Paste your Client ID                                    │
│    [ Spotify Client ID                   ]                 │
│    [ Connect Spotify                     ]                 │
│                                                            │
│ Other options                                              │
│ Explore demo · View shared profile · Owner Access           │
└────────────────────────────────────────────────────────────┘
```

On mobile, steps stack vertically. Buttons remain full width.

### Step 1 copy

```text
Create a Spotify app

1. Open the Spotify Developer Dashboard.
2. Click Create app.
3. Add the redirect URI from step 2.
4. Select Web API.
5. Save the app.
```

Links:

```text
https://developer.spotify.com/dashboard/create
https://developer.spotify.com/dashboard
```

### Step 2 copy

```text
Add this redirect URI
```

Show the result of `redirectUri()` for the current deployment. Include a Copy
button and the exact value in selectable text.

The production URI is currently:

```text
https://spotify-analyzer.tawan-jhaidee.workers.dev/
```

Do not hardcode this value in the setup component. It must change
automatically when the app moves to another domain.

Supporting note:

```text
Copy the full link, including the final slash.
```

### Step 3 copy

```text
Paste your Client ID
```

Input:

```text
Spotify Client ID
```

Button:

```text
Connect Spotify
```

Supporting note:

```text
The Client ID is public. Never paste a Client Secret.
```

### Additional help

Put detailed instructions in an expandable section:

```text
How do I find my Client ID?

1. Open your app in the Spotify Developer Dashboard.
2. Open Settings.
3. Copy the value labelled Client ID.
4. Return here and paste it above.
```

## Existing user experience

When a valid Client ID is already stored, show a short confirmation instead of
the full setup wizard.

```text
Ready to connect

Spotify app: •••• 29b2
Redirect URI: ...

[ Connect Spotify ]
[ Change Spotify app ]
```

Do not display the complete Client ID as the primary visual focus. Show only
its final four characters with an option to reveal or replace it.

## Owner Access behavior

Show Owner Access only when `VITE_SPOTIFY_CLIENT_ID` is configured.

Selecting it must:

1. Clear any custom-app token.
2. Set the active source to `"owner"`.
3. Begin authorization using the configured Client ID.
4. Return to the dedicated setup screen after disconnecting.

Do not silently fall back from Owner Access to a custom app after a `403`.
Explain the problem and offer the alternate action.

Suggested error:

```text
This Spotify account is not approved for Owner Access.
Use your own Spotify app, view the demo, or open a shared profile instead.
```

## OAuth and callback flow

### Starting login

1. Resolve the active Client ID.
2. Store the OAuth verifier, state, persistence choice, and Client ID used for
   the request.
3. Redirect to Spotify with the normal PKCE parameters.

### Completing login

1. Read the Client ID recorded when login started.
2. Confirm it still matches the active identity.
3. Exchange the authorization code with that exact Client ID.
4. Store the token with the Client ID.
5. Remove the temporary OAuth state.
6. Load the dashboard.

Never use a fallback Client ID during callback completion. A mismatch must
clear the incomplete authentication attempt and ask the user to reconnect.

## Storage model

Use browser storage only. Client IDs are public.

Recommended keys:

```text
spotify-top-explorer-app-selection
spotify-top-explorer-token
spotify-top-explorer-verifier
spotify-top-explorer-state
spotify-top-explorer-persist
spotify-top-explorer-callback-client-id
```

Stored selection:

```ts
type SpotifyAppSource = "own" | "owner";

interface StoredSpotifyAppSelection {
  source: SpotifyAppSource;
  ownClientId?: string;
}

interface SelectedSpotifyApp {
  source: SpotifyAppSource;
  clientId: string;
}
```

Extend the token record so tokens cannot be reused with another app:

```ts
interface StoredSpotifyAuth {
  version: 2;
  clientId: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenIssuedAt: number;
}
```

Token persistence continues to follow the existing Remember me option.

Legacy version-1 tokens cannot prove which Client ID created them. Clear them
once during upgrade and require one reconnect.

## Identity resolution

Use one small, framework-independent selection service in
`src/services/spotify-app.ts`:

```ts
readSpotifyApp(ownerClientId: string): SelectedSpotifyApp | null;
saveOwnSpotifyApp(clientId: string): SelectedSpotifyApp;
saveOwnerSpotifyApp(ownerClientId: string): SelectedSpotifyApp;
clearSpotifyApp(): void;
```

Rules:

1. An explicitly saved custom app wins.
2. An explicitly saved Owner Access choice wins when the configured Client ID
   exists.
3. On a fresh browser, return `null` so the default custom-app wizard appears.
4. Do not automatically select Owner Access merely because a build Client ID
   exists.
5. Trim surrounding whitespace before validating or storing a Client ID.

## Input validation

- Reject empty values.
- Reject values that are obviously too short.
- Current Spotify Client IDs are 32 hexadecimal characters. Validate this
  format unless Spotify changes it.
- Display validation beside the input rather than in a generic alert.
- Clear the validation error when the value changes.

Suggested message:

```text
That does not look like a Spotify Client ID. Copy the 32-character Client ID
from your Spotify app settings.
```

## Changing or clearing the Spotify app

Provide:

```text
Change Spotify app
```

Changing the app must:

1. Clear the current access and refresh tokens.
2. Clear any incomplete OAuth values.
3. Remove or replace the stored Client ID.
4. Return to the appropriate setup step.

Disconnecting while keeping the Client ID should only clear authentication and
return to the "Ready to connect" screen.

## Error handling

### Redirect URI mismatch

```text
Spotify says the redirect URI does not match. Check that the URI below was
copied exactly into your Spotify app.
```

### Invalid Client ID

```text
Spotify did not recognize this Client ID. Check that it belongs to the app
where you added the redirect URI.
```

### `403` from Spotify

For Owner Access:

```text
This account is not approved for the shared connection. Use your own Spotify
app or view the demo.
```

For a custom app:

```text
Spotify rejected access for this app. Confirm that this Spotify account can
use the app and that the app is still in Development Mode.
```

### Missing configuration

If neither a saved Client ID nor a built-in Client ID exists, show the setup
wizard. Do not surface `VITE_SPOTIFY_CLIENT_ID` or other environment-variable
names to users.

## Component and service changes

Implemented files:

```text
src/app.tsx
src/pages/connection-page.tsx
src/components/connection-card.tsx
src/components/client-id-setup.tsx
src/services/spotify-app.ts
src/services/auth.ts
src/services/content.ts
src/models/auth.ts
src/api/spotify/client.ts
```

Keep dashboard, ranking, export, and sharing components unchanged.

App-level orchestration remains in `App`. A separate session hook or state
machine is intentionally deferred until the flow becomes complex enough to
justify it.

## Test plan

### Unit tests

- Resolve no identity on a fresh browser.
- Resolve a saved custom identity.
- Resolve Owner Access only when its build Client ID exists.
- Reject malformed Client IDs.
- Clear token data when the Client ID changes.
- Reject a token stored for a different Client ID.
- Start OAuth with the custom Client ID.
- Complete OAuth with the callback's recorded Client ID.

### Component tests

- Default screen shows Use Your Spotify App.
- Redirect URI is displayed and copied.
- Client ID validation and submit states work.
- Owner Access is hidden when no build Client ID exists.
- Owner Access is secondary when available.
- The previous token is cleared after changing apps.

### End-to-end tests

- Fresh visit -> setup -> Client ID -> Spotify authorization request.
- Returning callback -> dashboard.
- Change app -> old token removed -> setup restored.
- Owner Access uses the configured Client ID.
- `403` displays the recovery guidance.
- Desktop and mobile visual regression snapshots.
- Existing demo and shared-link journeys still work.

## README changes

The primary README flow must target non-developers.

Order:

1. Project title and one-sentence description
2. Live URL
3. User-facing features
4. Use Your Spotify App: three-step setup
5. Other options: demo, shared profile, Owner Access
6. Privacy
7. Troubleshooting
8. Development
9. Self-hosting and deployment
10. Technical architecture

### User-facing README copy

```markdown
## Use your Spotify data

You need a Spotify account. You only need to do this setup once.

### 1. Create a Spotify app

Open the Spotify Developer Dashboard and create an app.

Use this redirect URI:

https://spotify-analyzer.tawan-jhaidee.workers.dev/

Select **Web API**, then save the app.

### 2. Copy your Client ID

Open your new app, select **Settings**, and copy the **Client ID**.

The Client ID is public. You never need a Client Secret.

### 3. Connect

Return to Spotify Top Explorer, paste the Client ID, and select
**Connect Spotify**.
```

Include direct links:

```markdown
[Create a Spotify app](https://developer.spotify.com/dashboard/create)
[Open Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
```

### README language rules

- Do not call deployment a user requirement.
- Explain Client ID in one sentence.
- Put environment variables, OAuth, PKCE, Workers, and GitHub Actions below
  the user instructions.
- Use exact button labels users will see.
- Keep troubleshooting answers short and actionable.

## Privacy and security

- Store Client IDs in browser storage.
- Store OAuth tokens in browser storage according to Remember me.
- Never ask for a Client Secret.
- Never send tokens to a custom backend.
- Include the Client ID in stored token records to prevent cross-app reuse.
- Warn users that Owner Access is limited to approved accounts.
- Keep raw credentials and private local environment files out of Git.

## Implementation status

- [x] Implement Spotify app selection storage and resolution.
- [x] Update token records and callback validation for Client ID isolation.
- [x] Build the default Client ID setup screen.
- [x] Add Owner Access as a secondary path.
- [x] Add `403` recovery and change-app controls.
- [x] Update unit, component, and browser tests.
- [x] Rewrite the README user flow.
- [ ] Deploy a preview and verify with a real custom Spotify app.
- [ ] Merge to `main` after the preview verification.

## Acceptance criteria

- A new visitor sees **Use Your Spotify App** first.
- Setup requires only a Spotify Client ID.
- The current redirect URI is copyable and never hardcoded in the component.
- Each visitor's Client ID and token remain in their browser.
- The owner can choose the secondary Owner Access path.
- Missing, invalid, mismatched, and rejected credentials produce specific
  recovery messages.
- Changing Spotify apps cannot reuse an old token.
- Demo and shared-profile visitors need no Spotify setup.
- All existing tests pass, with new coverage for the custom-app flow.
