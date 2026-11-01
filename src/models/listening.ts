export const TIME_RANGES = [
  "short_term",
  "medium_term",
  "long_term",
] as const;

export type TimeRange = (typeof TIME_RANGES)[number];
export type ListeningType = "tracks" | "artists";

export interface Album {
  id: string;
  title: string;
  releaseDate: string;
  imageUrl: string;
  spotifyUrl: string;
}

export interface Track {
  id: string;
  title: string;
  artistNames: string[];
  album: Album;
  durationMs: number;
  explicit: boolean;
  spotifyUrl: string;
}

export interface Artist {
  id: string;
  name: string;
  imageUrl: string;
  spotifyUrl: string;
}

export interface ListeningData {
  tracks: Record<TimeRange, Track[]>;
  artists: Record<TimeRange, Artist[]>;
}

export type Trend =
  | { direction: "up" | "down"; places: number }
  | { direction: "new" | "stable" };

export interface RankingRow {
  id: string;
  rank: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  spotifyUrl: string;
  trend?: Trend;
}

export interface RankingListModel {
  type: ListeningType;
  range: TimeRange;
  showTrend: boolean;
  rows: RankingRow[];
}
