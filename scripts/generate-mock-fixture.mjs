import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = join(projectRoot, "tests/fixtures/spotify-catalog.json");
const outputPath = join(projectRoot, "public/test-fixtures/spotify-api.json");
const ranges = ["short_term", "medium_term", "long_term"];

const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
const approvedArtists = catalog.artists;
const approvedById = new Map(
  approvedArtists.map((artist, index) => [artist.id, { ...artist, index }]),
);
const blockedTrackNames = new Set(["crack baby", "born to die", "nude"]);
const blockedAlbumNames = new Set([
  "born to die - the paradise edition",
  "norman fucking rockwell!",
]);

function fixtureArtist(artistId) {
  const artist = approvedById.get(artistId);
  if (!artist) return null;
  return {
    external_urls: {
      spotify: `https://open.spotify.com/artist/${artist.id}`,
    },
    id: artist.id,
    images: [
      {
        height: 640,
        url: `test-fixtures/art-${artist.index + 1}.svg`,
        width: 640,
      },
    ],
    name: artist.name,
    type: "artist",
    uri: `spotify:artist:${artist.id}`,
  };
}

const allowedTracks = catalog.tracks
  .filter(
    (track) =>
      track.artists.length > 0 &&
      track.artists.every((artist) => approvedById.has(artist.id)) &&
      !blockedTrackNames.has(track.name.toLowerCase()) &&
      !blockedAlbumNames.has(track.album.name.toLowerCase()) &&
      !track.name.toLowerCase().includes("die anyway"),
  )
  .sort((left, right) => left.id.localeCompare(right.id));

if (allowedTracks.length < 64) {
  throw new Error(`Expected at least 64 approved tracks, got ${allowedTracks.length}`);
}

const groups = new Map(approvedArtists.map((artist) => [artist.id, []]));
for (const track of allowedTracks) {
  groups.get(track.artists[0].id).push(track);
}

const interleavedTracks = [];
const longestGroup = Math.max(...[...groups.values()].map((tracks) => tracks.length));
for (let index = 0; index < longestGroup; index += 1) {
  for (const artist of approvedArtists) {
    const track = groups.get(artist.id)[index];
    if (track) interleavedTracks.push(track);
  }
}

const selectedTracks = interleavedTracks.slice(0, 64);
const selectedTrackIds = new Set(selectedTracks.map((track) => track.id));
const clairoId = approvedArtists.find((artist) => artist.name === "Clairo")?.id;
for (const track of interleavedTracks) {
  if (selectedTrackIds.has(track.id) || track.artists[0]?.id !== clairoId) continue;
  const replacementIndex = selectedTracks.findLastIndex(
    (candidate) => candidate.artists[0]?.id !== clairoId,
  );
  selectedTrackIds.delete(selectedTracks[replacementIndex].id);
  selectedTracks[replacementIndex] = track;
  selectedTrackIds.add(track.id);
}

const albumNumbers = new Map();
for (const track of selectedTracks) {
  if (!albumNumbers.has(track.album.id)) {
    albumNumbers.set(track.album.id, albumNumbers.size + 1);
  }
}

function trackRecord(track) {
  const albumNumber = albumNumbers.get(track.album.id);
  const coverUrl = `test-fixtures/covers/album-${String(albumNumber).padStart(2, "0")}.svg`;
  return {
    album: {
      external_urls: {
        spotify: `https://open.spotify.com/album/${track.album.id}`,
      },
      id: track.album.id,
      images: [
        { height: 640, url: coverUrl, width: 640 },
        { height: 300, url: coverUrl, width: 300 },
        { height: 64, url: coverUrl, width: 64 },
      ],
      name: track.album.name,
      release_date: track.album.release_date,
      type: "album",
      uri: `spotify:album:${track.album.id}`,
    },
    artists: track.artists.map((artist) => fixtureArtist(artist.id)),
    duration_ms: track.duration_ms,
    explicit: track.explicit,
    external_urls: {
      spotify: `https://open.spotify.com/track/${track.id}`,
    },
    id: track.id,
    name: track.name,
    type: "track",
    uri: `spotify:track:${track.id}`,
  };
}

const mediumTracks = selectedTracks.slice(0, 50);
const longOnlyTracks = selectedTracks.slice(50, 54);
const shortOnlyTracks = selectedTracks.slice(54, 64);

const mediumKeys = mediumTracks.map((track) => track.id);
const longOnlyKeys = longOnlyTracks.map((track) => track.id);
const shortOnlyKeys = shortOnlyTracks.map((track) => track.id);
const trackById = new Map(selectedTracks.map((track) => [track.id, track]));

// Four tracks are new and scattered through the chart. The remaining 46 tracks
// preserve their rank except for 15 adjacent swaps, producing 15 one-place
// rises, 15 one-place falls, and 16 stable positions.
const newTrackPositions = new Set([2, 16, 30, 45]);
const remainingLongOnly = [...longOnlyKeys];
const longKeys = mediumKeys.map((trackId, index) =>
  newTrackPositions.has(index) ? remainingLongOnly.shift() : trackId,
);
let swappedPairs = 0;
for (let index = 0; index < longKeys.length - 1 && swappedPairs < 15; index += 1) {
  if (newTrackPositions.has(index) || newTrackPositions.has(index + 1)) continue;
  [longKeys[index], longKeys[index + 1]] = [
    longKeys[index + 1],
    longKeys[index],
  ];
  swappedPairs += 1;
  index += 1;
}

const shortKeys = [
  ...mediumKeys.slice(0, 40),
  ...shortOnlyKeys,
].map((trackId, index, values) => values[(index + 7) % values.length]);

const rangeKeys = {
  short_term: shortKeys,
  medium_term: mediumKeys,
  long_term: longKeys,
};

const topArtists = approvedArtists.slice(0, 7);
const artistRangeIds = {
  short_term: [
    topArtists[1].id,
    topArtists[0].id,
    topArtists[6].id,
    topArtists[2].id,
    topArtists[5].id,
    topArtists[4].id,
    topArtists[3].id,
  ],
  medium_term: topArtists.map((artist) => artist.id),
  long_term: [
    topArtists[2].id,
    topArtists[1].id,
    topArtists[0].id,
    topArtists[3].id,
    topArtists[5].id,
    topArtists[4].id,
  ],
};

const mockUserId = "fixture-user";
const mockFriendId = "fixture-friend";
const playlistSpecs = [
  {
    id: "fixture-playlist-current",
    name: "Current Rotation",
    description: "The songs getting the most replay right now.",
    owner: { id: mockUserId, display_name: "You" },
    trackIds: mediumKeys.slice(0, 12),
    public: false,
    collaborative: false,
  },
  {
    id: "fixture-playlist-night",
    name: "Late Night Drive",
    description: "A slower, atmospheric mix for the road after dark.",
    owner: { id: mockFriendId, display_name: "Friend account" },
    trackIds: mediumKeys.slice(12, 25),
    public: true,
    collaborative: false,
  },
  {
    id: "fixture-playlist-shared",
    name: "Shared Favorites",
    description: "A collaborative playlist for overlapping favorites.",
    owner: { id: mockFriendId, display_name: "Friend account" },
    trackIds: longKeys.slice(0, 14),
    public: true,
    collaborative: true,
  },
];

const playlistItems = playlistSpecs.map((playlist) => {
  const leadTrack = trackRecord(trackById.get(playlist.trackIds[0]));
  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    images: leadTrack.album.images,
    owner: playlist.owner,
    items: { total: playlist.trackIds.length },
    public: playlist.public,
    collaborative: playlist.collaborative,
    external_urls: {
      spotify: `https://open.spotify.com/playlist/${playlist.id}`,
    },
    track_ids: playlist.trackIds,
  };
});

const fixture = {
  fixture_version: 5,
  tracks: {},
  artists: {},
  playlists: {
    current_user_id: mockUserId,
    items: playlistItems,
  },
};

for (const range of ranges) {
  fixture.tracks[range] = {
    items: rangeKeys[range].map((trackId) => trackRecord(trackById.get(trackId))),
  };

  // Artist rankings contain unique artists. Repeating a short catalog would make
  // every medium-term artist look like a large riser against its final duplicate
  // in the yearly ranking.
  const artistItems = artistRangeIds[range].map(fixtureArtist);
  fixture.artists[range] = { items: artistItems };

  if (fixture.tracks[range].items.length !== 50) {
    throw new Error(`${range} must contain exactly 50 tracks`);
  }
  if (
    new Set(fixture.artists[range].items.map((artist) => artist.id)).size !==
    fixture.artists[range].items.length
  ) {
    throw new Error(`${range} artist rankings must contain unique artists`);
  }
}

await writeFile(outputPath, `${JSON.stringify(fixture, null, 2)}\n`, "utf8");
console.log(`Generated 50-item boundary fixture at ${outputPath}`);
