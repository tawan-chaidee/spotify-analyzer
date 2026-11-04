<script lang="ts">
  import { onMount } from "svelte";
  import {
    createSpotifyClient,
    type SpotifyClient,
  } from "./api/spotify/client";
  import AmbientCurrent from "./components/AmbientCurrent.svelte";
  import AppHeader from "./components/AppHeader.svelte";
  import { DashboardController } from "./features/dashboard/dashboard.svelte";
  import { SpotifySession } from "./features/spotify/session.svelte";
  import { createMockSpotifyClient } from "./mocks/spotify-client";
  import type { DashboardMode } from "./models/app";
  import ConnectionPage from "./routes/ConnectionPage.svelte";
  import DashboardPage from "./routes/DashboardPage.svelte";
  import { appPath, redirectUri } from "./services/auth";
  import { CONTENT } from "./services/content";
  import {
    clearShareHash,
    copyText,
    createShareUrl,
    hasShareHash,
    openShareData,
  } from "./services/sharing/share";

  const APP_MODE = __APP_MODE__;
  const AUTH_SOURCE = __AUTH_SOURCE__;
  const DATA_SOURCE = __DATA_SOURCE__;
  const MOCK_OWN_CLIENT_ID = "00000000000000000000000000000001";
  const MOCK_OWNER_CLIENT_ID = "00000000000000000000000000000002";
  const OWNER_CLIENT_ID = (
    import.meta.env.VITE_SPOTIFY_CLIENT_ID ||
    (APP_MODE === "mock-auth" ? MOCK_OWNER_CLIENT_ID : "")
  ).trim();

  const session = new SpotifySession({
    appMode: APP_MODE,
    authSource: AUTH_SOURCE,
    ownerClientId: OWNER_CLIENT_ID,
    mockOwnClientId: MOCK_OWN_CLIENT_ID,
  });
  const dashboard = new DashboardController();

  let page = $state<"connection" | "dashboard">("connection");
  let mode = $state<DashboardMode>(
    DATA_SOURCE === "mock" ? "mock" : "private",
  );
  let shareStatus = $state("");
  let initialized = false;

  const spotify: SpotifyClient = $derived(
    DATA_SOURCE === "mock"
      ? createMockSpotifyClient()
      : createSpotifyClient({
          getAccessToken: session.auth.getAccessToken,
        }),
  );
  const callback = $derived(redirectUri());

  $effect(() => {
    document.title =
      page === "dashboard" && mode === "shared"
        ? "Your friend’s Spotify taste"
        : CONTENT.app.name;
  });

  async function loadDashboard(nextMode: "private" | "mock") {
    session.message = "";
    session.isError = false;
    const loaded = await dashboard.load(
      spotify,
      session.forbiddenMessage(),
    );
    session.finish();
    if (loaded) {
      mode = nextMode;
      page = "dashboard";
      return;
    }

    page = "connection";
    session.isError = true;
    session.message = dashboard.error || "Unable to load rankings.";
  }

  async function initialize() {
    session.message = "";

    if (hasShareHash()) {
      try {
        dashboard.setSharedData(await openShareData(window.location.hash));
        mode = "shared";
        page = "dashboard";
      } catch (error) {
        session.isError = true;
        session.message = `Unable to open shared view: ${
          error instanceof Error ? error.message : "Invalid share link."
        }`;
      }
      return;
    }

    if (APP_MODE === "demo") {
      await loadDashboard("mock");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.has("code") || params.has("error")) {
      const authenticated = await session.completeCallback(params);
      if (!authenticated) {
        window.history.replaceState({}, "", appPath());
        return;
      }
      window.history.replaceState({}, "", appPath());
      await loadDashboard("private");
      return;
    }

    if (session.readAuth()) {
      await loadDashboard("private");
    } else {
      session.message = session.readyOrInitialMessage();
    }
  }

  onMount(() => {
    if (initialized) return;
    initialized = true;
    void initialize();
  });

  async function connect() {
    if (await session.connectSelected()) {
      await loadDashboard("private");
    }
  }

  async function connectWithOwnApp(clientId: string) {
    if (await session.connectWithOwnApp(clientId)) {
      await loadDashboard("private");
    }
  }

  async function connectWithOwnerApp() {
    if (await session.connectWithOwnerApp()) {
      await loadDashboard("private");
    }
  }

  async function share() {
    shareStatus = CONTENT.dashboard.sharing;
    try {
      const url = await createShareUrl(dashboard.data);
      await copyText(url);
      shareStatus = CONTENT.dashboard.copied;
      window.setTimeout(() => (shareStatus = ""), 3_500);
    } catch (error) {
      shareStatus =
        error instanceof Error ? error.message : "Unable to create share link.";
    }
  }

  function disconnect() {
    session.disconnect();
    dashboard.reset();
    page = "connection";
    mode = DATA_SOURCE === "mock" ? "mock" : "private";
  }

  function changeSpotifyApp() {
    session.changeApp();
    dashboard.reset();
    page = "connection";
    mode = DATA_SOURCE === "mock" ? "mock" : "private";
  }

  function ownTaste() {
    clearShareHash();
    window.location.assign(appPath());
  }
</script>

<div class="relative isolate min-h-screen overflow-x-clip">
  <AmbientCurrent />
  <div
    class="relative z-10 mx-auto w-[min(1180px,calc(100%-32px))] py-7 pb-14 max-[560px]:w-[calc(100%-22px)] max-[560px]:pt-4"
  >
    <AppHeader
      {mode}
      status={shareStatus}
      isMock={DATA_SOURCE === "mock"}
      onshare={page === "dashboard" ? share : undefined}
      ondisconnect={mode === "private" && page === "dashboard"
        ? disconnect
        : undefined}
      onowntaste={mode === "shared" ? ownTaste : undefined}
    />

    {#if page === "connection"}
      <ConnectionPage
        selectedApp={session.selectedApp}
        ownerAvailable={session.ownerAvailable}
        initialClientId={session.initialClientId}
        remember={session.remember}
        redirectUri={callback}
        message={session.message}
        isError={session.isError}
        busy={session.busy}
        onrememberchange={(value) => (session.remember = value)}
        onconnect={connect}
        onclientidsubmit={connectWithOwnApp}
        onowneraccess={connectWithOwnerApp}
        onchangeapp={changeSpotifyApp}
      />
    {:else}
      <DashboardPage
        model={dashboard.model}
        data={dashboard.data}
        {mode}
        busy={dashboard.loading}
        ontypechange={(type) => dashboard.setType(type)}
        onrangechange={(range) => dashboard.setRange(range)}
      />
    {/if}
  </div>
</div>
