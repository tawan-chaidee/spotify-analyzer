import type {
  Artist,
  ListeningData,
  Track,
} from "../../models/listening";
import { TIME_RANGES } from "../../models/listening";
import type {
  CompactArtist,
  CompactSnapshot,
  CompactTrack,
  ExpandedSnapshot,
} from "../../models/share";

function compactTrack(track: Track): CompactTrack {
  return [
    track.id,
    track.title,
    track.artistNames,
    track.album.id,
    track.album.title,
    track.album.releaseDate,
    track.album.imageUrl,
    track.durationMs,
    track.explicit ? 1 : 0,
  ];
}

function compactArtist(artist: Artist): CompactArtist {
  return [artist.id, artist.name, artist.imageUrl];
}

function expandTrack(row: CompactTrack): Track {
  const [id, title, artistNames, albumId, albumTitle, releaseDate, imageUrl, durationMs, explicit] =
    row;
  return {
    id,
    title,
    artistNames,
    album: {
      id: albumId,
      title: albumTitle,
      releaseDate,
      imageUrl,
      spotifyUrl: albumId
        ? `https://open.spotify.com/album/${albumId}`
        : "",
    },
    durationMs,
    explicit: Boolean(explicit),
    spotifyUrl: id ? `https://open.spotify.com/track/${id}` : "",
  };
}

function expandArtist(row: CompactArtist): Artist {
  const [id, name, imageUrl] = row;
  return {
    id,
    name,
    imageUrl,
    spotifyUrl: id ? `https://open.spotify.com/artist/${id}` : "",
  };
}

export function compactListeningData(
  data: ListeningData,
): CompactSnapshot {
  return {
    version: 1,
    created_at: new Date().toISOString(),
    data: {
      tracks: Object.fromEntries(
        TIME_RANGES.map((range) => [
          range,
          data.tracks[range].map(compactTrack),
        ]),
      ),
      artists: Object.fromEntries(
        TIME_RANGES.map((range) => [
          range,
          data.artists[range].map(compactArtist),
        ]),
      ),
    },
  };
}

export function expandListeningData(value: unknown): ExpandedSnapshot {
  const snapshot = value as CompactSnapshot;
  if (snapshot?.version !== 1 || !snapshot.data) {
    throw new Error("This share link uses an unsupported format.");
  }

  return {
    tracks: {
      short_term: (snapshot.data.tracks?.short_term || []).map(expandTrack),
      medium_term: (snapshot.data.tracks?.medium_term || []).map(expandTrack),
      long_term: (snapshot.data.tracks?.long_term || []).map(expandTrack),
    },
    artists: {
      short_term: (snapshot.data.artists?.short_term || []).map(expandArtist),
      medium_term: (snapshot.data.artists?.medium_term || []).map(expandArtist),
      long_term: (snapshot.data.artists?.long_term || []).map(expandArtist),
    },
  };
}
