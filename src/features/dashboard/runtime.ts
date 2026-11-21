import type { SpotifyClient } from "../../api/spotify/client";
import type { DashboardController } from "./dashboard.svelte";

type DashboardPageComponent =
  typeof import("../../pages/dashboard/DashboardPage.svelte").default;

export type DashboardRuntime = {
  controller: DashboardController;
  client: SpotifyClient;
  Page: DashboardPageComponent;
};

type DashboardRuntimeOptions = {
  dataSource: "live" | "mock";
  getAccessToken: () => Promise<string>;
};

export function createDashboardRuntimeLoader({
  dataSource,
  getAccessToken,
}: DashboardRuntimeOptions): () => Promise<DashboardRuntime> {
  let runtimePromise: Promise<DashboardRuntime> | null = null;

  async function loadRuntime(): Promise<DashboardRuntime> {
    const [controllerModule, pageModule, clientModule] = await Promise.all([
      import("./dashboard.svelte"),
      import("../../pages/dashboard/DashboardPage.svelte"),
      dataSource === "mock"
        ? import("../../mocks/spotify-client")
        : import("../../api/spotify/client"),
    ]);

    const controller = new controllerModule.DashboardController();
    const client =
      "createMockSpotifyClient" in clientModule
        ? clientModule.createMockSpotifyClient()
        : clientModule.createSpotifyClient({ getAccessToken });

    return {
      controller,
      client,
      Page: pageModule.default,
    };
  }

  return () => {
    runtimePromise ??= loadRuntime().catch((error: unknown) => {
      runtimePromise = null;
      throw error;
    });
    return runtimePromise;
  };
}
