import type {
  ListeningType,
  RankingRow,
  TimeRange,
} from "./listening";

export interface DashboardSelection {
  type: ListeningType;
  range: TimeRange;
}

export interface SpotlightCard {
  kind: "track" | "album";
  title: string;
  subtitle: string;
  imageUrl: string;
  spotifyUrl: string;
}

export type StatMetric =
  | "rankedTracks"
  | "uniqueArtists"
  | "uniqueAlbums"
  | "averageDuration";

export interface StatCard {
  metric: StatMetric;
  value: string;
}

export interface ReleaseYearInsight {
  year: string;
  count: number;
  percentage: number;
}

export interface InsightModel {
  sharedItemCount: number;
  currentItemCount: number;
  releaseYears: ReleaseYearInsight[];
}

export interface DashboardModel {
  selection: DashboardSelection;
  spotlights: SpotlightCard[];
  stats: StatCard[];
  ranking: {
    type: ListeningType;
    range: TimeRange;
    showTrend: boolean;
    rows: RankingRow[];
  };
  insights: InsightModel;
  exports: {
    currentCount: number;
    totalCount: number;
  };
}
