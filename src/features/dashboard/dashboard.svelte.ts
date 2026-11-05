import {
  SpotifyApiError,
  type SpotifyClient,
} from "../../api/spotify/client";
import type { DashboardSelection } from "../../models/dashboard";
import {
  type ListeningData,
  type RankingType,
  type TimeRange,
} from "../../models/listening";
import type {
  DashboardView,
  PlaylistSummary,
  PlaylistTrack,
} from "../../models/playlist";
import { createDashboardModel } from "../../services/dashboard";
import { loadAllRankings } from "../../services/rankings";
import { CONTENT } from "../../services/content";

const EMPTY_DATA: ListeningData = {
  tracks: {
    short_term: [],
    medium_term: [],
    long_term: [],
  },
  artists: {
    short_term: [],
    medium_term: [],
    long_term: [],
  },
};

export class DashboardController {
  data = $state<ListeningData>(EMPTY_DATA);
  selection = $state<DashboardSelection>({
    type: "tracks",
    range: "medium_term",
  });
  loading = $state(false);
  error = $state<string | null>(null);
  view = $state<DashboardView>("listening");
  playlists = $state<PlaylistSummary[]>([]);
  selectedPlaylistId = $state<string | null>(null);
  playlistTracks = $state<Record<string, PlaylistTrack[]>>({});
  playlistsLoading = $state(false);
  playlistTracksLoading = $state(false);
  playlistsError = $state("");
  playlistTracksError = $state("");
  playlistsNeedPermission = $state(false);
  private client: SpotifyClient | null = null;
  private playlistsLoaded = false;

  model = $derived(createDashboardModel(this.data, this.selection));

  setType(type: RankingType): void {
    this.selection = { ...this.selection, type };
  }

  setRange(range: TimeRange): void {
    this.selection = { ...this.selection, range };
  }

  setView(view: DashboardView): void {
    this.view = view;
    if (view === "playlists" && !this.playlistsLoaded) {
      void this.loadPlaylists();
    }
  }

  async loadPlaylists(): Promise<void> {
    if (!this.client || this.playlistsLoading) return;

    this.playlistsLoading = true;
    this.playlistsError = "";
    this.playlistsNeedPermission = false;
    try {
      this.playlists = await this.client.getPlaylists();
      this.playlistsLoaded = true;
      this.playlistsNeedPermission = false;
      this.playlistTracksError = "";
      if (
        this.playlists.length > 0 &&
        !this.playlists.some(
          (playlist) => playlist.id === this.selectedPlaylistId,
        )
      ) {
        const firstId = this.playlists[0].id;
        this.selectedPlaylistId = firstId;
        void this.loadPlaylistTracks(firstId);
      }
    } catch (error) {
      this.handlePlaylistError(error, CONTENT.playlists.error);
    } finally {
      this.playlistsLoading = false;
    }
  }

  async selectPlaylist(playlistId: string): Promise<void> {
    this.selectedPlaylistId = playlistId;
    this.playlistTracksError = "";
    const playlist = this.playlists.find((item) => item.id === playlistId);
    if (playlist && !playlist.isOwned && !playlist.isCollaborative) {
      this.playlistsNeedPermission = false;
      this.playlistTracksError =
        CONTENT.playlists.followedTracksUnavailable;
      return;
    }
    if (!this.playlistTracks[playlistId]) {
      await this.loadPlaylistTracks(playlistId);
    }
  }

  async loadPlaylistTracks(playlistId: string): Promise<void> {
    if (!this.client || this.playlistTracksLoading) return;

    this.playlistTracksLoading = true;
    this.playlistTracksError = "";
    try {
      const tracks = await this.client.getPlaylistTracks(playlistId);
      this.playlistTracks = {
        ...this.playlistTracks,
        [playlistId]: tracks,
      };
      this.playlistsNeedPermission = false;
      this.playlistTracksError = "";
    } catch (error) {
      if (this.selectedPlaylistId === playlistId) {
        this.handlePlaylistError(
          error,
          CONTENT.playlists.tracksError,
          true,
        );
      }
    } finally {
      this.playlistTracksLoading = false;
    }
  }

  private handlePlaylistError(
    error: unknown,
    fallback: string,
    tracks = false,
  ): void {
    const forbidden =
      error instanceof SpotifyApiError && error.status === 403;
    const message =
      error instanceof Error ? error.message : fallback;
    this.playlistsNeedPermission = forbidden;
    if (tracks) {
      this.playlistTracksError = forbidden
        ? CONTENT.playlists.permission
        : message;
    } else {
      this.playlistsError = forbidden
        ? CONTENT.playlists.permission
        : message;
    }
  }

  setSharedData(data: ListeningData): void {
    this.data = data;
    this.error = null;
    this.view = "listening";
  }

  reset(): void {
    this.data = EMPTY_DATA;
    this.loading = false;
    this.error = null;
    this.view = "listening";
    this.playlists = [];
    this.selectedPlaylistId = null;
    this.playlistTracks = {};
    this.playlistsLoading = false;
    this.playlistTracksLoading = false;
    this.playlistsError = "";
    this.playlistTracksError = "";
    this.playlistsNeedPermission = false;
    this.playlistsLoaded = false;
    this.client = null;
  }

  async load(
    client: SpotifyClient,
    forbiddenMessage: string,
  ): Promise<boolean> {
    this.loading = true;
    this.error = null;
    this.client = client;
    try {
      this.data = await loadAllRankings(client);
      this.playlists = [];
      this.selectedPlaylistId = null;
      this.playlistTracks = {};
      this.playlistsLoaded = false;
      return true;
    } catch (error) {
      this.error =
        error instanceof SpotifyApiError && error.status === 403
          ? forbiddenMessage
          : error instanceof Error
            ? error.message
            : "Unable to load rankings.";
      return false;
    } finally {
      this.loading = false;
    }
  }
}
