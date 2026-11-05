import type { Track } from "./listening";

export type DashboardView = "listening" | "playlists";
export type PlaylistFilter = "all" | "owned" | "followed";
export type PlaylistSort = "spotify" | "name" | "tracks";

export interface PlaylistSummary {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName: string;
  trackCount: number;
  imageUrl: string;
  spotifyUrl: string;
  isOwned: boolean;
  isPublic: boolean;
  isCollaborative: boolean;
}

export interface PlaylistTrack extends Track {
  addedAt: string;
}
