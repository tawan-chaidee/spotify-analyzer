import type {
  DashboardModel,
  DashboardSelection,
  ReleaseYearInsight,
  SpotlightCard,
  StatCard,
} from "../models/dashboard";
import type {
  ListeningData,
  RankingRow,
  Track,
  Trend,
} from "../models/listening";
import { TIME_RANGES } from "../models/listening";
import { CONTENT } from "./content";
import { formatDuration } from "../utils/format";

export function createDashboardModel(
  data: ListeningData,
  selection: DashboardSelection,
): DashboardModel {
  const tracks = data.tracks[selection.range];
  const showTrend =
    selection.type === "tracks" && selection.range === "medium_term";
  const yearlyRanks = new Map(
    data.tracks.long_term.map((track, index) => [track.id, index + 1]),
  );

  const rows: RankingRow[] =
    selection.type === "tracks"
      ? data.tracks[selection.range].map((track, index) => ({
          id: track.id,
          rank: index + 1,
          title: track.title,
          subtitle: `${track.artistNames.join(", ")} · ${track.album.title}`,
          imageUrl: track.album.imageUrl,
          spotifyUrl: track.spotifyUrl,
          trend: showTrend
            ? createTrend(yearlyRanks.get(track.id), index + 1)
            : undefined,
        }))
      : data.artists[selection.range].map((artist, index) => ({
          id: artist.id,
          rank: index + 1,
          title: artist.name,
          subtitle: CONTENT.ranking.artistMeta,
          imageUrl: artist.imageUrl,
          spotifyUrl: artist.spotifyUrl,
        }));

  const selectedByRange =
    selection.type === "tracks" ? data.tracks : data.artists;
  const mediumIds = new Set(
    selectedByRange.medium_term.map((item) => item.id),
  );
  const longIds = new Set(
    selectedByRange.long_term.map((item) => item.id),
  );
  const sharedItemCount = selectedByRange.short_term.filter(
    (item) => mediumIds.has(item.id) && longIds.has(item.id),
  ).length;

  const currentItemCount = selectedByRange[selection.range].length;

  return {
    selection,
    spotlights: createSpotlights(tracks),
    stats: createStats(tracks),
    ranking: {
      type: selection.type,
      range: selection.range,
      showTrend,
      rows,
    },
    insights: {
      sharedItemCount,
      currentItemCount,
      releaseYears: createReleaseYears(tracks),
    },
    exports: {
      currentCount: currentItemCount,
      totalCount: ["tracks", "artists"].reduce(
        (total, type) =>
          total +
          TIME_RANGES.reduce(
            (sum, range) =>
              sum + data[type as "tracks" | "artists"][range].length,
            0,
          ),
        0,
      ),
    },
  };
}

function createTrend(
  yearlyRank: number | undefined,
  currentRank: number,
): Trend {
  if (!yearlyRank) {
    return { direction: "new" };
  }

  const change = yearlyRank - currentRank;
  if (change > 0) return { direction: "up", places: change };
  if (change < 0) {
    return { direction: "down", places: Math.abs(change) };
  }
  return { direction: "stable" };
}

function createSpotlights(tracks: Track[]): SpotlightCard[] {
  const cards: SpotlightCard[] = [];
  const topTrack = tracks[0];
  if (topTrack) {
    cards.push({
      kind: "track",
      title: topTrack.title,
      subtitle: topTrack.artistNames.join(", "),
      imageUrl: topTrack.album.imageUrl,
      spotifyUrl: topTrack.spotifyUrl,
    });
  }

  const albums = new Map<
    string,
    {
      title: string;
      imageUrl: string;
      spotifyUrl: string;
      artists: string;
      count: number;
      bestRank: number;
    }
  >();
  tracks.forEach((track, index) => {
    const key =
      track.album.id ||
      `${track.album.title}|${track.artistNames.join(",")}`;
    const existing = albums.get(key) || {
      title: track.album.title,
      imageUrl: track.album.imageUrl,
      spotifyUrl: track.album.spotifyUrl,
      artists: track.artistNames.join(", "),
      count: 0,
      bestRank: index + 1,
    };
    existing.count += 1;
    existing.bestRank = Math.min(existing.bestRank, index + 1);
    albums.set(key, existing);
  });

  const topAlbum = [...albums.values()].sort(
    (left, right) =>
      right.count - left.count || left.bestRank - right.bestRank,
  )[0];
  if (topAlbum) {
    cards.push({
      kind: "album",
      title: topAlbum.title,
      subtitle: `${topAlbum.artists} · ${topAlbum.count} ranked ${
        topAlbum.count === 1 ? "track" : "tracks"
      }`,
      imageUrl: topAlbum.imageUrl,
      spotifyUrl: topAlbum.spotifyUrl,
    });
  }

  return cards;
}

function createStats(tracks: Track[]): StatCard[] {
  const artists = new Set<string>();
  const albums = new Set<string>();
  let totalDuration = 0;
  let explicitCount = 0;

  for (const track of tracks) {
    for (const artist of track.artistNames) artists.add(artist);
    if (track.album.id) albums.add(track.album.id);
    totalDuration += track.durationMs;
    if (track.explicit) explicitCount += 1;
  }

  const averageDuration = tracks.length
    ? totalDuration / tracks.length
    : 0;
  const explicitPercent = tracks.length
    ? Math.round((explicitCount / tracks.length) * 100)
    : 0;

  return [
    { metric: "rankedTracks", value: String(tracks.length) },
    { metric: "uniqueArtists", value: String(artists.size) },
    { metric: "uniqueAlbums", value: String(albums.size) },
    {
      metric: "averageDuration",
      value: `${formatDuration(averageDuration)} · ${explicitPercent}%`,
    },
  ];
}

function createReleaseYears(tracks: Track[]): ReleaseYearInsight[] {
  const counts = new Map<string, number>();
  for (const track of tracks) {
    const year = track.album.releaseDate.slice(0, 4);
    if (/^\d{4}$/.test(year)) {
      counts.set(year, (counts.get(year) || 0) + 1);
    }
  }

  const entries = [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6);
  const max = Math.max(1, ...entries.map(([, count]) => count));
  return entries.map(([year, count]) => ({
    year,
    count,
    percentage: (count / max) * 100,
  }));
}
