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
import { createDashboardModel } from "../../services/dashboard";
import { loadAllRankings } from "../../services/rankings";

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

  model = $derived(createDashboardModel(this.data, this.selection));

  setType(type: RankingType): void {
    this.selection = { ...this.selection, type };
  }

  setRange(range: TimeRange): void {
    this.selection = { ...this.selection, range };
  }

  setSharedData(data: ListeningData): void {
    this.data = data;
    this.error = null;
  }

  reset(): void {
    this.data = EMPTY_DATA;
    this.loading = false;
    this.error = null;
  }

  async load(
    client: SpotifyClient,
    forbiddenMessage: string,
  ): Promise<boolean> {
    this.loading = true;
    this.error = null;
    try {
      this.data = await loadAllRankings(client);
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
