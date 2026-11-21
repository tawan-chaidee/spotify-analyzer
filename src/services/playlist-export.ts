import type {
  PlaylistSummary,
  PlaylistTrack,
} from "../models/playlist";
import { csv, type ExportFile } from "./export";

export function createPlaylistLibraryCsv(
  playlists: PlaylistSummary[],
): ExportFile {
  const rows: unknown[][] = [[
    "playlist_name",
    "owner",
    "owned",
    "visibility",
    "collaborative",
    "track_count",
  ]];

  for (const playlist of playlists) {
    rows.push([
      playlist.name,
      playlist.ownerName,
      playlist.isOwned ? "yes" : "no",
      playlist.isPublic ? "public" : "private",
      playlist.isCollaborative ? "yes" : "no",
      playlist.trackCount,
    ]);
  }

  return {
    filename: "spotify-playlist-library.csv",
    content: csv(rows),
    type: "text/csv;charset=utf-8",
  };
}

export function createPlaylistLibraryJson(
  playlists: PlaylistSummary[],
): ExportFile {
  return {
    filename: "spotify-playlist-library.json",
    content: JSON.stringify(
      {
        schema_version: 2,
        exported_at: new Date().toISOString(),
        items: playlists.map((playlist) => ({
          playlist_name: playlist.name,
          description: playlist.description,
          owner: playlist.ownerName,
          owned: playlist.isOwned,
          public: playlist.isPublic,
          collaborative: playlist.isCollaborative,
          track_count: playlist.trackCount,
        })),
      },
      null,
      2,
    ),
    type: "application/json",
  };
}

export function createPlaylistTracksCsv(
  playlist: PlaylistSummary,
  tracks: PlaylistTrack[],
): ExportFile {
  const rows: unknown[][] = [[
    "position",
    "track_name",
    "artist_name",
    "album",
  ]];

  tracks.forEach((track, index) => {
    rows.push([
      index + 1,
      track.title,
      track.artistNames.join(", "),
      track.album.title,
    ]);
  });

  return {
    filename: `${playlistFilename(playlist.name)}.csv`,
    content: csv(rows),
    type: "text/csv;charset=utf-8",
  };
}

export function createPlaylistTracksJson(
  playlist: PlaylistSummary,
  tracks: PlaylistTrack[],
): ExportFile {
  return {
    filename: `${playlistFilename(playlist.name)}.json`,
    content: JSON.stringify(
      {
        schema_version: 2,
        exported_at: new Date().toISOString(),
        playlist: {
          name: playlist.name,
          description: playlist.description,
          owner: playlist.ownerName,
          public: playlist.isPublic,
          collaborative: playlist.isCollaborative,
          track_count: playlist.trackCount,
        },
        items: tracks.map((track, index) => ({
          position: index + 1,
          track_name: track.title,
          artist_name: track.artistNames.join(", "),
          album_name: track.album.title,
        })),
      },
      null,
      2,
    ),
    type: "application/json",
  };
}

function playlistFilename(value: string): string {
  return (
    value
      .normalize("NFKC")
      .trim()
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
      .replace(/\s+/g, " ")
      .replace(/[. ]+$/g, "") || "Playlist"
  );
}
