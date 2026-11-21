<script lang="ts">
  import { onMount } from "svelte";
  import {
    createDashboardRuntimeLoader,
    type DashboardRuntime,
  } from "./features/dashboard/runtime";
  import { SpotifySession } from "./features/spotify/session.svelte";
  import type { DashboardMode } from "./models/dashboard";
  import AuthPage from "./pages/auth/AuthPage.svelte";
  import DashboardRoute from "./pages/dashboard/DashboardRoute.svelte";
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

  type AppPage = "booting" | "connection" | "dashboard";

  const session = new SpotifySession({
    appMode: APP_MODE,
    authSource: AUTH_SOURCE,
    ownerClientId: OWNER_CLIENT_ID,
    mockOwnClientId: MOCK_OWN_CLIENT_ID,
  });
  const loadDashboardRuntime = createDashboardRuntimeLoader({
    dataSource: DATA_SOURCE,
    getAccessToken: session.auth.getAccessToken,
  });

  let page = $state<AppPage>(initialPage());
  let dashboardRuntime = $state.raw<DashboardRuntime | null>(null);
  let mode = $state<DashboardMode>(
    DATA_SOURCE === "mock" ? "mock" : "private",
  );
  let shareStatus = $state("");
  const callback = $derived(redirectUri());

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

  $effect(() => {
    if (page !== "connection") return;

    const connection = (
      navigator as Navigator & {
        connection?: {
          saveData?: boolean;
          effectiveType?: string;
        };
      }
    ).connection;
    if (
      connection &&
      (connection.saveData ||
        connection.effectiveType === "slow-2g" ||
        connection.effectiveType === "2g")
    ) {
      return;
    }

    const prefetch = () => {
      if (page === "connection") {
        void prepareDashboardRuntime().catch(() => {});
      }
    };
    let idleHandle: number | undefined;
    const timer = window.setTimeout(() => {
      idleHandle = window.requestIdleCallback(prefetch, {
        timeout: 1_500,
      });
    }, 1_200);

    document.addEventListener("pointerdown", prefetch, {
      capture: true,
      once: true,
    });
    document.addEventListener("focusin", prefetch, {
      capture: true,
      once: true,
    });

    return () => {
      window.clearTimeout(timer);
      if (idleHandle !== undefined) {
        window.cancelIdleCallback(idleHandle);
      }
      document.removeEventListener("pointerdown", prefetch, true);
      document.removeEventListener("focusin", prefetch, true);
    };
  });

  async function prepareDashboardRuntime(): Promise<DashboardRuntime> {
    if (dashboardRuntime) return dashboardRuntime;
    dashboardRuntime = await loadDashboardRuntime();
    return dashboardRuntime;
  }

  async function loadDashboard(nextMode: "private" | "mock") {
    session.message = "";
    session.isError = false;
    try {
      const runtime = await prepareDashboardRuntime();
      const loaded = await runtime.controller.load(
        runtime.client,
        session.forbiddenMessage(),
      );
      session.finish();
      if (!loaded) {
        sessionStorage.removeItem(PLAYLIST_RESUME_KEY);
        page = "connection";
        session.isError = true;
        session.message =
          runtime.controller.error || "Unable to load rankings.";
        return;
      }

      if (sessionStorage.getItem(PLAYLIST_RESUME_KEY) === "1") {
        runtime.controller.setView("playlists");
      }
      sessionStorage.removeItem(PLAYLIST_RESUME_KEY);
      mode = nextMode;
      page = "dashboard";
    } catch (error) {
      sessionStorage.removeItem(PLAYLIST_RESUME_KEY);
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
        const runtime = await prepareDashboardRuntime();
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
      return;
    }

    if (session.readAuth()) {
      await loadDashboard("private");
      return;
    }

    session.message = session.readyOrInitialMessage();
    page = "connection";
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

  async function reconnectForPlaylists(): Promise<boolean> {
    sessionStorage.setItem(PLAYLIST_RESUME_KEY, "1");
    const connected = await session.reconnectSelected();
    if (connected) {
      sessionStorage.removeItem(PLAYLIST_RESUME_KEY);
    }
    return connected;
  }

  async function share() {
    if (!dashboardRuntime) return;
    shareStatus = CONTENT.dashboard.sharing;
    try {
      const { createShareUrl } = await import("./services/sharing/share");
      const url = await createShareUrl(dashboardRuntime.controller.data);
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
    if (dashboardRuntime) dashboardRuntime.controller.reset();
    page = "connection";
    mode = DATA_SOURCE === "mock" ? "mock" : "private";
  }

  function changeSpotifyApp() {
    session.changeApp();
    if (dashboardRuntime) dashboardRuntime.controller.reset();
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
{:else if dashboardRuntime}
  <DashboardRoute
    runtime={dashboardRuntime}
    {mode}
    status={shareStatus}
    onshare={share}
    onplaylistreconnect={reconnectForPlaylists}
    ondisconnect={mode === "private" ? disconnect : undefined}
    onowntaste={mode === "shared" ? ownTaste : undefined}
  />
{:else}
  <LoadingPage />
{/if}
