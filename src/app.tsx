import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createSpotifyClient,
  SpotifyApiError,
  type SpotifyClient,
} from "./api/spotify/client";
import { AppHeader } from "./components/app-header";
import { createMockSpotifyClient } from "./mocks/spotify-client";
import type { DashboardMode } from "./models/app";
import type { SelectedSpotifyApp } from "./models/auth";
import type { DashboardSelection } from "./models/dashboard";
import type {
  ListeningData,
  ListeningType,
  TimeRange,
} from "./models/listening";
import { ConnectionPage } from "./pages/connection-page";
import { DashboardPage } from "./pages/dashboard-page";
import {
  appPath,
  clearAuth,
  createAuthService,
  redirectUri,
} from "./services/auth";
import { CONTENT } from "./services/content";
import { createDashboardModel } from "./services/dashboard";
import { loadAllRankings } from "./services/rankings";
import {
  clearShareHash,
  copyText,
  createShareUrl,
  hasShareHash,
  openShareData,
} from "./services/sharing/share";
import {
  clearSpotifyApp,
  readSpotifyApp,
  saveOwnSpotifyApp,
  saveOwnerSpotifyApp,
} from "./services/spotify-app";

const DATA_SOURCE = __DATA_SOURCE__;
const OWNER_CLIENT_ID = (
  import.meta.env.VITE_SPOTIFY_CLIENT_ID || ""
).trim();

const EMPTY_DATA: ListeningData = {
  tracks: { short_term: [], medium_term: [], long_term: [] },
  artists: { short_term: [], medium_term: [], long_term: [] },
};

export function App() {
  const [data, setData] = useState<ListeningData>(EMPTY_DATA);
  const [selection, setSelection] = useState<DashboardSelection>({
    type: "tracks",
    range: "medium_term",
  });
  const [page, setPage] = useState<"connection" | "dashboard">("connection");
  const [mode, setMode] = useState<DashboardMode>(
    DATA_SOURCE === "mock" ? "mock" : "private",
  );
  const [remember, setRemember] = useState(true);
  const [message, setMessage] = useState<string>(
    CONTENT.connection.initialMessage,
  );
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [spotifyApp, setSpotifyApp] =
    useState<SelectedSpotifyApp | null>(() =>
      DATA_SOURCE === "mock"
        ? null
        : readSpotifyApp(OWNER_CLIENT_ID),
    );
  const initialized = useRef(false);

  const auth = useMemo(
    () =>
      createAuthService({
        clientId: spotifyApp?.clientId || "",
      }),
    [spotifyApp?.clientId],
  );
  const spotify: SpotifyClient =
    useMemo(
      () =>
        DATA_SOURCE === "mock"
          ? createMockSpotifyClient()
          : createSpotifyClient({
              getAccessToken: auth.getAccessToken,
            }),
      [auth],
    );

  function updateSelection(
    change: Partial<DashboardSelection>,
  ) {
    setSelection((current) => ({ ...current, ...change }));
  }

  async function loadDashboard(nextMode: "private" | "mock") {
    setBusy(true);
    setMessage("");
    setIsError(false);
    try {
      const rankings = await loadAllRankings(spotify);
      setData(rankings);
      setMode(nextMode);
      setPage("dashboard");
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof SpotifyApiError && error.status === 403
          ? spotifyApp?.source === "owner"
            ? CONTENT.connection.ownerForbidden
            : CONTENT.connection.ownForbidden
          : error instanceof Error
            ? error.message
            : "Unable to load rankings.",
      );
      setPage("connection");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function initialize() {
      setMessage("");

      if (hasShareHash()) {
        setBusy(true);
        try {
          const shared = await openShareData(window.location.hash);
          setData(shared);
          setMode("shared");
          setPage("dashboard");
        } catch (error) {
          setIsError(true);
          setMessage(
            `Unable to open shared view: ${
              error instanceof Error ? error.message : "Invalid share link."
            }`,
          );
        } finally {
          setBusy(false);
        }
        return;
      }

      if (DATA_SOURCE === "mock") {
        await loadDashboard("mock");
        return;
      }

      const params = new URLSearchParams(window.location.search);
      if (params.has("code") || params.has("error")) {
        if (!spotifyApp) {
          clearAuth();
          setIsError(true);
          setMessage(CONTENT.connection.initialMessage);
          window.history.replaceState({}, "", appPath());
          return;
        }
        setBusy(true);
        try {
          setMessage(CONTENT.connection.completing);
          await auth.completeLogin(params);
          window.history.replaceState({}, "", appPath());
          await loadDashboard("private");
        } catch (error) {
          setIsError(true);
          setMessage(
            error instanceof Error
              ? error.message
              : "Spotify authorization failed.",
          );
        } finally {
          setBusy(false);
        }
        return;
      }

      if (auth.readAuth()) {
        await loadDashboard("private");
      } else {
        setMessage(
          spotifyApp
            ? CONTENT.connection.readyMessage
            : CONTENT.connection.initialMessage,
        );
      }
    }

    void initialize();
    // The composition is intentionally initialized once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const title =
      page === "connection"
        ? CONTENT.app.name
        : mode === "shared"
          ? "Your friend’s Spotify taste"
          : CONTENT.app.name;
    document.title = title;
  }, [mode, page]);

  async function connect() {
    if (!spotifyApp) {
      setIsError(true);
      setMessage(CONTENT.connection.initialMessage);
      return;
    }
    setBusy(true);
    setMessage("");
    setIsError(false);
    try {
      await auth.beginLogin(remember);
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to start Spotify authorization.",
      );
      setBusy(false);
    }
  }

  async function connectWithOwnApp(clientId: string) {
    setBusy(true);
    setMessage("");
    setIsError(false);
    try {
      if (spotifyApp?.clientId !== clientId) clearAuth();
      const selection = saveOwnSpotifyApp(clientId);
      setSpotifyApp(selection);
      const ownAuth = createAuthService({
        clientId: selection.clientId,
      });
      await ownAuth.beginLogin(remember);
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to use this Spotify app.",
      );
      setBusy(false);
    }
  }

  async function connectWithOwnerApp() {
    setBusy(true);
    setMessage("");
    setIsError(false);
    try {
      if (spotifyApp?.clientId !== OWNER_CLIENT_ID) clearAuth();
      const selection = saveOwnerSpotifyApp(OWNER_CLIENT_ID);
      setSpotifyApp(selection);
      const ownerAuth = createAuthService({
        clientId: selection.clientId,
      });
      await ownerAuth.beginLogin(remember);
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Owner Access is unavailable.",
      );
      setBusy(false);
    }
  }

  async function share() {
    setShareStatus(CONTENT.dashboard.sharing);
    try {
      const url = await createShareUrl(data);
      await copyText(url);
      setShareStatus(CONTENT.dashboard.copied);
      window.setTimeout(() => setShareStatus(""), 3500);
    } catch (error) {
      setShareStatus(
        error instanceof Error ? error.message : "Unable to create share link.",
      );
    }
  }

  function disconnect() {
    clearAuth();
    setData(EMPTY_DATA);
    setPage("connection");
    setMode(DATA_SOURCE === "mock" ? "mock" : "private");
    setMessage(
      spotifyApp
        ? CONTENT.connection.readyMessage
        : CONTENT.connection.initialMessage,
    );
  }

  function changeSpotifyApp() {
    clearAuth();
    clearSpotifyApp();
    setSpotifyApp(null);
    setData(EMPTY_DATA);
    setPage("connection");
    setMode(DATA_SOURCE === "mock" ? "mock" : "private");
    setMessage(CONTENT.connection.initialMessage);
    setIsError(false);
  }

  function ownTaste() {
    clearShareHash();
    window.location.assign(appPath());
  }

  const dashboardModel = createDashboardModel(data, selection);
  const callback = redirectUri();

  return (
    <div className="mx-auto w-[min(1180px,calc(100%-32px))] py-7 pb-14 max-[560px]:w-[calc(100%-22px)] max-[560px]:pt-4">
      <AppHeader
        mode={mode}
        status={shareStatus}
        isMock={DATA_SOURCE === "mock"}
        onShare={page === "dashboard" ? share : undefined}
        onDisconnect={
          mode === "private" && page === "dashboard"
            ? disconnect
            : undefined
        }
        onOwnTaste={mode === "shared" ? ownTaste : undefined}
      />

      {page === "connection" ? (
        <ConnectionPage
          selectedApp={spotifyApp}
          ownerAvailable={Boolean(OWNER_CLIENT_ID)}
          remember={remember}
          redirectUri={callback}
          message={message}
          isError={isError}
          busy={busy}
          onRememberChange={setRemember}
          onConnect={connect}
          onClientIdSubmit={connectWithOwnApp}
          onOwnerAccess={connectWithOwnerApp}
          onChangeApp={changeSpotifyApp}
        />
      ) : (
        <DashboardPage
          model={dashboardModel}
          data={data}
          mode={mode}
          busy={busy}
          onTypeChange={(type: ListeningType) =>
            updateSelection({ type })
          }
          onRangeChange={(range: TimeRange) =>
            updateSelection({ range })
          }
        />
      )}
    </div>
  );
}
