import type {
  Artist,
  Track,
} from "../../models/listening";
import type {
  SpotifyAlbumDto,
  SpotifyArtistDto,
  SpotifyTrackDto,
} from "./types";

function spotifyUrl(
  value: string | undefined,
  type: "album" | "artist" | "track",
  id: string,
): string {
  return value || (id ? `https://open.spotify.com/${type}/${id}` : "");
}

export function mapSpotifyAlbum(album: SpotifyAlbumDto) {
  return {
    id: album.id,
    title: album.name,
    releaseDate: album.release_date || "",
    imageUrl: album.images?.[0]?.url || "",
    spotifyUrl: spotifyUrl(album.external_urls?.spotify, "album", album.id),
  };
}

export function mapSpotifyTrack(track: SpotifyTrackDto): Track {
  return {
    id: track.id,
    title: track.name,
    artistNames: (track.artists || [])
      .map((artist) => artist.name)
      .filter(Boolean),
    album: mapSpotifyAlbum(track.album || {
      id: "",
      name: "",
    }),
    durationMs: Number(track.duration_ms) || 0,
    explicit: Boolean(track.explicit),
    spotifyUrl: spotifyUrl(track.external_urls?.spotify, "track", track.id),
  };
}

export function mapSpotifyArtist(artist: SpotifyArtistDto): Artist {
  return {
    id: artist.id,
    name: artist.name,
    imageUrl: artist.images?.[0]?.url || "",
    spotifyUrl: spotifyUrl(
      artist.external_urls?.spotify,
      "artist",
      artist.id,
    ),
  };
}
