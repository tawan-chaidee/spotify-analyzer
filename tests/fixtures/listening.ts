import type {
  Artist,
  ListeningData,
  TimeRange,
  Track,
} from "../../src/models/listening";

function track(
  id: string,
  title: string,
  rankSeed: number,
): Track {
  return {
    id,
    title,
    artistNames: [`Artist ${rankSeed}`, "Guest"],
    album: {
      id: `album-${rankSeed}`,
      title: `Album ${rankSeed}`,
      releaseDate: `202${rankSeed % 5}-01-01`,
      imageUrl: `/test-fixtures/covers/album-${String(rankSeed).padStart(2, "0")}.svg`,
      spotifyUrl: `https://open.spotify.com/album/album-${rankSeed}`,
    },
    durationMs: 180_000 + rankSeed * 1000,
    explicit: rankSeed % 3 === 0,
    spotifyUrl: `https://open.spotify.com/track/${id}`,
  };
}

function artist(id: string, name: string): Artist {
  return {
    id,
    name,
    imageUrl: "/test-fixtures/art-1.svg",
    spotifyUrl: `https://open.spotify.com/artist/${id}`,
  };
}

export function createListeningFixture(): ListeningData {
  const tracks = {
    short_term: [
      track("a", "Alpha, \"One\"", 1),
      track("b", "Beta", 2),
      track("c", "Gamma", 3),
    ],
    medium_term: [
      track("a", "Alpha, \"One\"", 1),
      track("b", "Beta", 2),
      track("c", "Gamma", 3),
      track("d", "New Song", 4),
    ],
    long_term: [
      track("b", "Beta", 2),
      track("a", "Alpha, \"One\"", 1),
      track("c", "Gamma", 3),
    ],
  } as Record<TimeRange, Track[]>;

  return {
    tracks,
    artists: {
      short_term: [artist("artist-a", "Artist A")],
      medium_term: [
        artist("artist-a", "Artist A"),
        artist("artist-b", "Artist B"),
      ],
      long_term: [artist("artist-a", "Artist A")],
    },
  };
}
