import type { ListeningData } from "./listening";

export type CompactTrack = [
  id: string,
  name: string,
  artistNames: string[],
  albumId: string,
  albumName: string,
  releaseDate: string,
  imageUrl: string,
  durationMs: number,
  explicit: number,
];

export type CompactArtist = [
  id: string,
  name: string,
  imageUrl: string,
];

export interface SharedSnapshot {
  version: 1;
  created_at: string;
  data: ListeningData;
}

export interface CompactSnapshot {
  version: 1;
  created_at: string;
  data: {
    tracks: Record<string, CompactTrack[]>;
    artists: Record<string, CompactArtist[]>;
  };
}

export type ExpandedSnapshot = ListeningData;
