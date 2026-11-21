<script lang="ts">
  import { onMount } from "svelte";
  import type { SpotifyClient } from "./api/spotify/client";
  import type { DashboardController } from "./features/dashboard/dashboard.svelte";
  import { SpotifySession } from "./features/spotify/session.svelte";
  import type { DashboardMode } from "./models/dashboard";
  import AuthPage from "./pages/auth/AuthPage.svelte";
  import LoadingPage from "./pages/LoadingPage.svelte";
  import { appPath, redirectUri } from "./services/auth";
  import { copyText } from "./services/clipboard";
  import { CONTENT } from "./services/content";
  import {
    clearShareHash,
    hasShareHash,
  } from "./services/sharing/hash";

  const APP_MODE = __APP_MODE__;
  const AUTH_SOURCE = __AUTH_SOURCE__;
  const DATA_SOURCE = __DATA_SOURCE__;
  const MOCK_OWN_CLIENT_ID = "00000000000000000000000000000001";
  const MOCK_OWNER_CLIENT_ID = "00000000000000000000000000000002";
  const PLAYLIST_RESUME_KEY = "spotify-top-explorer-resume-playlists";
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
  type AppPage = "booting" | "connection" | "dashboard";
  type DashboardPageComponent =
    typeof import("./pages/dashboard/DashboardPage.svelte").default;

  let page = $state<AppPage>(initialPage());
  let DashboardPage = $state<DashboardPageComponent | null>(null);
  let dashboard = $state.raw<DashboardController | null>(null);
  let dashboardRuntimePromise:
    | Promise<{
        controller: DashboardController;
        client: SpotifyClient;
      }>
    | null = null;
  let mode = $state<DashboardMode>(
    DATA_SOURCE === "mock" ? "mock" : "private",
  );
  let shareStatus = $state("");
  const callback = $derived(redirectUri());
  const selectedPlaylistTracks = $derived(
    dashboard?.selectedPlaylistId
      ? dashboard.playlistTracks[dashboard.selectedPlaylistId] || []
      : [],
  );

  function initialPage(): AppPage {
    if (hasShareHash() || APP_MODE === "demo") return "booting";

    const params = new URLSearchParams(window.location.search);
    if (params.has("code") || params.has("error")) return "booting";

    if (session.readAuth()) return "booting";

    session.message = session.readyOrInitialMessage();
    return "connection";
  }

  $effect(() => {
    document.title =
      page === "dashboard" && mode === "shared"
        ? "Your friend’s Spotify taste"
        : CONTENT.app.name;
  });

  function dashboardRuntime() {
    dashboardRuntimePromise ??= (async () => {
      try {
        const [controllerModule, pageModule, clientModule] =
          await Promise.all([
            import("./features/dashboard/dashboard.svelte"),
            import("./pages/dashboard/DashboardPage.svelte"),
            DATA_SOURCE === "mock"
              ? import("./mocks/spotify-client")
              : import("./api/spotify/client"),
          ]);

        const controller = new controllerModule.DashboardController();
        const client =
          "createMockSpotifyClient" in clientModule
            ? clientModule.createMockSpotifyClient()
            : clientModule.createSpotifyClient({
                getAccessToken: session.auth.getAccessToken,
              });
        dashboard = controller;
        DashboardPage = pageModule.default;
        return { controller, client };
      } catch (error) {
        dashboardRuntimePromise = null;
        throw error;
      }
    })();

    return dashboardRuntimePromise;
  }

  async function loadDashboard(nextMode: "private" | "mock") {
    session.message = "";
    session.isError = false;
    try {
      const runtime = await dashboardRuntime();
      const loaded = await runtime.controller.load(
        runtime.client,
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
      session.message =
        runtime.controller.error || "Unable to load rankings.";
    } catch (error) {
      page = "connection";
      session.fail(error, CONTENT.startup.error);
    }
  }

  async function initialize() {
    session.message = "";

    if (hasShareHash()) {
      try {
        const { openShareData } = await import("./services/sharing/share");
        const data = await openShareData(window.location.hash);
        const runtime = await dashboardRuntime();
        runtime.controller.setSharedData(data);
        mode = "shared";
        page = "dashboard";
      } catch (error) {
        page = "connection";
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
        sessionStorage.removeItem(PLAYLIST_RESUME_KEY);
        window.history.replaceState({}, "", appPath());
        page = "connection";
        return;
      }
      window.history.replaceState({}, "", appPath());
      await loadDashboard("private");
      if (page === "dashboard") {
        restorePlaylistView();
      } else {
        sessionStorage.removeItem(PLAYLIST_RESUME_KEY);
      }
      return;
    }

    if (session.readAuth()) {
      await loadDashboard("private");
    } else {
      session.message = session.readyOrInitialMessage();
      page = "connection";
    }
  }

  onMount(() => {
    if (page !== "booting") return;
    void initialize().catch((error: unknown) => {
      page = "connection";
      session.isError = true;
      session.message =
        error instanceof Error
          ? error.message
          : CONTENT.startup.error;
    });
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

  async function reconnectForPlaylists() {
    sessionStorage.setItem(PLAYLIST_RESUME_KEY, "1");
    if (await session.reconnectSelected()) {
      sessionStorage.removeItem(PLAYLIST_RESUME_KEY);
      dashboard?.setView("playlists");
    }
  }

  function restorePlaylistView() {
    if (sessionStorage.getItem(PLAYLIST_RESUME_KEY) !== "1") return;
    sessionStorage.removeItem(PLAYLIST_RESUME_KEY);
    dashboard?.setView("playlists");
  }

  async function share() {
    if (!dashboard) return;
    shareStatus = CONTENT.dashboard.sharing;
    try {
      const { createShareUrl } = await import("./services/sharing/share");
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
    sessionStorage.removeItem(PLAYLIST_RESUME_KEY);
    session.disconnect();
    dashboard?.reset();
    page = "connection";
    mode = DATA_SOURCE === "mock" ? "mock" : "private";
  }

  function changeSpotifyApp() {
    session.changeApp();
    dashboard?.reset();
    page = "connection";
    mode = DATA_SOURCE === "mock" ? "mock" : "private";
  }

  function ownTaste() {
    clearShareHash();
    window.location.assign(appPath());
  }
</script>

{#if page === "booting"}
  <LoadingPage />
{:else if page === "connection"}
  <AuthPage
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
{:else if dashboard && DashboardPage}
  <DashboardPage
    model={dashboard.model}
    data={dashboard.data}
    {mode}
    busy={dashboard.loading}
    status={shareStatus}
    view={dashboard.view}
    playlists={dashboard.playlists}
    selectedPlaylistId={dashboard.selectedPlaylistId}
    playlistTracks={selectedPlaylistTracks}
    playlistsLoading={dashboard.playlistsLoading}
    playlistTracksLoading={dashboard.playlistTracksLoading}
    playlistsError={dashboard.playlistsError}
    playlistTracksError={dashboard.playlistTracksError}
    playlistsNeedPermission={dashboard.playlistsNeedPermission}
    playlistQuery={dashboard.playlistQuery}
    playlistFilter={dashboard.playlistFilter}
    playlistSort={dashboard.playlistSort}
    ontypechange={(type) => dashboard?.setType(type)}
    onrangechange={(range) => dashboard?.setRange(range)}
    onviewchange={(view) => dashboard?.setView(view)}
    onplaylistselect={(playlistId) =>
      dashboard?.selectPlaylist(playlistId)}
    onplaylistretry={() => dashboard?.loadPlaylists()}
    onplaylistreconnect={reconnectForPlaylists}
    onplaylistquerychange={(query) => dashboard?.setPlaylistQuery(query)}
    onplaylistfilterchange={(filter) =>
      dashboard?.setPlaylistFilter(filter)}
    onplaylistsortchange={(sort) => dashboard?.setPlaylistSort(sort)}
    onshare={share}
    ondisconnect={mode === "private" ? disconnect : undefined}
    onowntaste={mode === "shared" ? ownTaste : undefined}
  />
{:else}
  <LoadingPage />
{/if}
