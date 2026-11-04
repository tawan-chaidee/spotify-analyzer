import {
  clearAuth,
  createAuthService,
  createMockAuthService,
  type LoginStart,
} from "../../services/auth";
import { CONTENT } from "../../services/content";
import {
  clearSpotifyApp,
  readSpotifyApp,
  saveOwnSpotifyApp,
  saveOwnerSpotifyApp,
} from "../../services/spotify-app";
import type { SelectedSpotifyApp } from "../../models/auth";

type AppMode = "live" | "demo" | "mock-auth";
type AuthSource = "real" | "mock";

interface SpotifySessionOptions {
  appMode: AppMode;
  authSource: AuthSource;
  ownerClientId: string;
  mockOwnClientId: string;
}

export class SpotifySession {
  readonly appMode: AppMode;
  readonly ownerClientId: string;
  readonly mockOwnClientId: string;
  readonly ownerAvailable: boolean;
  readonly initialClientId: string | undefined;

  selectedApp = $state<SelectedSpotifyApp | null>(null);
  remember = $state(false);
  busy = $state(false);
  message = $state<string>(CONTENT.connection.initialMessage);
  isError = $state(false);
  private readonly authSource: AuthSource;

  auth = $derived.by(() =>
    this.createAuth(this.selectedApp?.clientId || ""),
  );

  constructor(options: SpotifySessionOptions) {
    this.appMode = options.appMode;
    this.authSource = options.authSource;
    this.ownerClientId = options.ownerClientId;
    this.mockOwnClientId = options.mockOwnClientId;
    this.ownerAvailable = Boolean(options.ownerClientId);
    this.initialClientId =
      options.appMode === "mock-auth"
        ? options.mockOwnClientId
        : undefined;
    this.remember = options.appMode !== "mock-auth";
    this.selectedApp =
      options.appMode === "demo"
        ? null
        : readSpotifyApp(options.ownerClientId);
    if (this.selectedApp) {
      this.message = CONTENT.connection.readyMessage;
    }
  }

  private createAuth(clientId: string) {
    return this.authSource === "mock"
      ? createMockAuthService({ clientId })
      : createAuthService({ clientId });
  }

  private async start(
    client: ReturnType<SpotifySession["createAuth"]>,
  ): Promise<boolean> {
    this.busy = true;
    this.message = "";
    this.isError = false;
    try {
      const result: LoginStart = await client.beginLogin(this.remember);
      if (result === "redirecting") {
        this.busy = false;
        return false;
      }
      return true;
    } catch (error) {
      this.fail(error, "Unable to start Spotify authorization.");
      return false;
    }
  }

  async connectSelected(): Promise<boolean> {
    if (!this.selectedApp) {
      this.message = CONTENT.connection.initialMessage;
      this.isError = true;
      return false;
    }
    return this.start(this.auth);
  }

  async connectWithOwnApp(clientId: string): Promise<boolean> {
    try {
      if (this.selectedApp?.clientId !== clientId) clearAuth();
      this.selectedApp = saveOwnSpotifyApp(clientId);
      return await this.start(
        this.createAuth(this.selectedApp.clientId),
      );
    } catch (error) {
      this.fail(error, "Unable to use this Spotify app.");
      return false;
    }
  }

  async connectWithOwnerApp(): Promise<boolean> {
    try {
      if (this.selectedApp?.clientId !== this.ownerClientId) clearAuth();
      this.selectedApp = saveOwnerSpotifyApp(this.ownerClientId);
      return await this.start(
        this.createAuth(this.selectedApp.clientId),
      );
    } catch (error) {
      this.fail(error, "Owner Access is unavailable.");
      return false;
    }
  }

  async completeCallback(params: URLSearchParams): Promise<boolean> {
    if (!this.selectedApp) {
      clearAuth();
      this.message = CONTENT.connection.initialMessage;
      this.isError = true;
      return false;
    }

    this.busy = true;
    this.isError = false;
    this.message = CONTENT.connection.completing;
    try {
      await this.auth.completeLogin(params);
      return true;
    } catch (error) {
      this.fail(error, "Spotify authorization failed.");
      return false;
    }
  }

  finish(): void {
    this.busy = false;
  }

  readAuth(): boolean {
    return Boolean(this.auth.readAuth());
  }

  readyOrInitialMessage(): string {
    return this.selectedApp
      ? CONTENT.connection.readyMessage
      : CONTENT.connection.initialMessage;
  }

  disconnect(): void {
    clearAuth();
    this.busy = false;
    this.isError = false;
    this.message = this.readyOrInitialMessage();
  }

  changeApp(): void {
    clearAuth();
    clearSpotifyApp();
    this.selectedApp = null;
    this.busy = false;
    this.isError = false;
    this.message = CONTENT.connection.initialMessage;
  }

  fail(error: unknown, fallback: string): void {
    this.busy = false;
    this.isError = true;
    this.message = error instanceof Error ? error.message : fallback;
  }

  forbiddenMessage(): string {
    return this.selectedApp?.source === "owner"
      ? CONTENT.connection.ownerForbidden
      : CONTENT.connection.ownForbidden;
  }
}
