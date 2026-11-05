import type {
  ListeningData,
  RankingType,
  TimeRange,
} from "../models/listening";
import { TIME_RANGES } from "../models/listening";
import { rankAlbums } from "./albums";
import { rangeLabel } from "./content";

export interface ExportFile {
  filename: string;
  content: string;
  type: string;
}

export function csvCell(value: unknown): string {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function csv(rows: unknown[][]): string {
  return `\ufeff${rows
    .map((row) => row.map(csvCell).join(","))
    .join("\n")}\n`;
}

export function createCurrentCsv(
  data: ListeningData,
  type: RankingType,
  range: TimeRange,
): ExportFile {
  const headers =
    type === "tracks"
      ? ["ranking", "track_name", "artist_name", "time_range"]
      : type === "artists"
        ? ["ranking", "artist_name", "time_range"]
        : [
            "ranking",
            "album_name",
            "artist_name",
            "ranked_tracks",
            "best_track_rank",
            "score",
            "time_range",
          ];
  const rows: unknown[][] = [headers];

  if (type === "tracks") {
    data.tracks[range].forEach((item, index) => {
      rows.push([
        index + 1,
        item.title,
        item.artistNames.join(", "),
        rangeLabel(range),
      ]);
    });
  } else if (type === "artists") {
    data.artists[range].forEach((item, index) => {
      rows.push([index + 1, item.name, rangeLabel(range)]);
    });
  } else {
    rankAlbums(data.tracks[range]).forEach((album) => {
      rows.push([
        album.rank,
        album.title,
        album.artistNames,
        album.trackCount,
        album.bestTrackRank,
        album.score,
        rangeLabel(range),
      ]);
    });
  }

  return {
    filename: `top-${type}-${range}.csv`,
    content: csv(rows),
    type: "text/csv;charset=utf-8",
  };
}

export function createCurrentJson(
  data: ListeningData,
  type: RankingType,
  range: TimeRange,
): ExportFile {
  const items =
    type === "tracks"
      ? data.tracks[range].map((item, index) => ({
          ranking: index + 1,
          track_name: item.title,
          artist_name: item.artistNames.join(", "),
        }))
      : type === "artists"
        ? data.artists[range].map((item, index) => ({
            ranking: index + 1,
            artist_name: item.name,
          }))
        : rankAlbums(data.tracks[range]).map((album) => ({
            ranking: album.rank,
            album_name: album.title,
            artist_name: album.artistNames,
            ranked_tracks: album.trackCount,
            best_track_rank: album.bestTrackRank,
            score: album.score,
          }));

  return {
    filename: `top-${type}-${range}.json`,
    content: JSON.stringify(
      {
        schema_version: 1,
        exported_at: new Date().toISOString(),
        ranking_type: type,
        time_range: rangeLabel(range),
        items,
      },
      null,
      2,
    ),
    type: "application/json",
  };
}

export function createCompleteCsv(data: ListeningData): ExportFile {
  const rows: unknown[][] = [[
    "type",
    "time_range",
    "ranking",
    "name",
    "artist_name",
    "album",
    "release_date",
    "duration_ms",
    "explicit",
  ]];

  for (const range of TIME_RANGES) {
    data.tracks[range].forEach((item, index) => {
      rows.push([
        "track",
        rangeLabel(range),
        index + 1,
        item.title,
        item.artistNames.join(", "),
        item.album.title,
        item.album.releaseDate,
        item.durationMs,
        item.explicit,
      ]);
    });
  }
  for (const range of TIME_RANGES) {
    data.artists[range].forEach((item, index) => {
      rows.push([
        "artist",
        rangeLabel(range),
        index + 1,
        item.name,
        "",
        "",
        "",
        "",
        "",
      ]);
    });
  }

  return {
    filename: "spotify-complete-rankings.csv",
    content: csv(rows),
    type: "text/csv;charset=utf-8",
  };
}

export function createCompleteJson(data: ListeningData): ExportFile {
  return {
    filename: "spotify-complete-data.json",
    content: JSON.stringify(
      {
        schema_version: 1,
        exported_at: new Date().toISOString(),
        time_ranges: Object.fromEntries(
          TIME_RANGES.map((range) => [range, rangeLabel(range)]),
        ),
        data,
      },
      null,
      2,
    ),
    type: "application/json",
  };
}

export function downloadExport(file: ExportFile): void {
  const url = URL.createObjectURL(
    new Blob([file.content], { type: file.type }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
