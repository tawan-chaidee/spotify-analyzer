import type { RankingRow, Track } from "../models/listening";

export interface AlbumRankingEntry extends RankingRow {
  score: number;
  trackCount: number;
  bestTrackRank: number;
  artistNames: string;
}

interface AlbumAggregate {
  id: string;
  title: string;
  imageUrl: string;
  spotifyUrl: string;
  artistNames: Set<string>;
  score: number;
  trackCount: number;
  bestTrackRank: number;
}

export function rankAlbums(tracks: Track[]): AlbumRankingEntry[] {
  const albums = new Map<string, AlbumAggregate>();

  tracks.forEach((track, index) => {
    const trackRank = index + 1;
    const albumId =
      track.album.id ||
      `${track.album.title}|${track.artistNames.join(",")}`;
    const existing = albums.get(albumId) || {
      id: albumId,
      title: track.album.title || "Unknown album",
      imageUrl: track.album.imageUrl,
      spotifyUrl: track.album.spotifyUrl,
      artistNames: new Set<string>(),
      score: 0,
      trackCount: 0,
      bestTrackRank: trackRank,
    };

    for (const artistName of track.artistNames) {
      existing.artistNames.add(artistName);
    }
    existing.score += tracks.length - trackRank + 1;
    existing.trackCount += 1;
    existing.bestTrackRank = Math.min(existing.bestTrackRank, trackRank);
    albums.set(albumId, existing);
  });

  return [...albums.values()]
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.trackCount - left.trackCount ||
        left.bestTrackRank - right.bestTrackRank ||
        left.title.localeCompare(right.title),
    )
    .map((album, index) => ({
      id: album.id,
      rank: index + 1,
      title: album.title,
      subtitle: `${[...album.artistNames].join(", ")} · ${
        album.trackCount
      } ranked ${album.trackCount === 1 ? "track" : "tracks"} · best #${
        album.bestTrackRank
      } · ${album.score} pts`,
      imageUrl: album.imageUrl,
      spotifyUrl: album.spotifyUrl,
      score: album.score,
      trackCount: album.trackCount,
      bestTrackRank: album.bestTrackRank,
      artistNames: [...album.artistNames].join(", "),
    }));
}
