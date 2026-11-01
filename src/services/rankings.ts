import type { SpotifyClient } from "../api/spotify/client";
import type {
  Artist,
  ListeningData,
  Track,
  TimeRange,
} from "../models/listening";
import { TIME_RANGES } from "../models/listening";

export async function loadAllRankings(
  spotify: SpotifyClient,
): Promise<ListeningData> {
  const requests = TIME_RANGES.flatMap((range) => [
    spotify.getTopTracks(range, 50).then(
      (items): ["tracks", TimeRange, Track[]] => ["tracks", range, items],
    ),
    spotify.getTopArtists(range, 50).then(
      (items): ["artists", TimeRange, Artist[]] => [
        "artists",
        range,
        items,
      ],
    ),
  ]);

  const results = await Promise.all(requests);
  const data: ListeningData = {
    tracks: {
      short_term: [],
      medium_term: [],
      long_term: [],
    },
    artists: {
      short_term: [],
      medium_term: [],
      long_term: [],
    },
  };

  for (const [type, range, items] of results) {
    if (type === "tracks") {
      data.tracks[range] = items as Track[];
    } else {
      data.artists[range] = items as Artist[];
    }
  }

  return data;
}
