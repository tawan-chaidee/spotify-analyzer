import type {
  PlaylistFilter,
  PlaylistSort,
  PlaylistSummary,
} from "../models/playlist";

export function filterAndSortPlaylists(
  playlists: PlaylistSummary[],
  options: {
    query: string;
    filter: PlaylistFilter;
    sort: PlaylistSort;
  },
): PlaylistSummary[] {
  const normalizedQuery = options.query.trim().toLowerCase();
  const filtered = playlists.filter((playlist) => {
    if (options.filter === "owned" && !playlist.isOwned) return false;
    if (options.filter === "followed" && playlist.isOwned) return false;
    if (!normalizedQuery) return true;
    return `${playlist.name} ${playlist.ownerName}`
      .toLowerCase()
      .includes(normalizedQuery);
  });

  if (options.sort === "name") {
    return filtered.sort((left, right) =>
      left.name.localeCompare(right.name),
    );
  }
  if (options.sort === "tracks") {
    return filtered.sort(
      (left, right) => right.trackCount - left.trackCount,
    );
  }
  return filtered;
}
