import type {
  ListeningType,
  TimeRange,
  Trend,
} from "../models/listening";

export const CONTENT = {
  app: {
    name: "Spotify Top Explorer",
    logo: "ST",
  },
  connection: {
    eyebrow: "Spotify top-list explorer",
    title: "Your listening taste, ranked.",
    description:
      "Compare your top artists and tracks across the last four weeks, six months, and year. Export every ranking as CSV or JSON.",
    cardTitle: "Connect Spotify",
    cardDescription:
      "This app requests one read-only permission: access to your top artists and tracks.",
    remember: "Keep me connected on this device. This stores Spotify tokens in this browser.",
    connect: "Connect Spotify",
    connecting: "Connecting…",
    redirectLabel: "Redirect URI",
    redirectUnavailable: "Unavailable when opened as a local file",
    initialMessage: "Connect your Spotify account to load your rankings.",
    completing: "Completing Spotify authorization…",
  },
  dashboard: {
    ownerEyebrow: "Spotify top-list explorer",
    ownerTitle: "Your listening taste.",
    ownerNote: "Based on calculated rankings, up to 50 items per range.",
    sharedEyebrow: "Shared with you",
    sharedTitle: "Your friend’s taste.",
    sharedNote:
      "Explore the tracks and artists your friend has been listening to lately. No Spotify login needed.",
    mockBadge: "Demo data",
    share: "Copy share link",
    sharing: "Preparing…",
    copied: "Link copied",
    shareReady: "Share link ready",
    disconnect: "Disconnect",
    ownTaste: "See your own taste",
  },
  controls: {
    contentLabel: "Content type",
    rangeLabel: "Time range",
    tracks: "Tracks",
    artists: "Artists",
  },
  range: {
    short_term: {
      short: "4 weeks",
      long: "Last 4 weeks",
    },
    medium_term: {
      short: "6 months",
      long: "Last 6 months",
    },
    long_term: {
      short: "1 year",
      long: "Last year",
    },
  } satisfies Record<TimeRange, { short: string; long: string }>,
  ranking: {
    title: {
      tracks: "Top tracks",
      artists: "Top artists",
    } satisfies Record<ListeningType, string>,
    showingPrefix: "Showing all",
    movement: "Movement vs 1 year",
    empty: "No ranking data is available for this selection.",
    spotifyLink: "Opens Spotify in a new tab.",
    rank: "Rank",
    trackKicker: "#1 track",
    albumKicker: "Top album",
    artistMeta: "Spotify artist",
  },
  trend: {
    label: {
      up: "Up",
      down: "Down",
      new: "New",
      stable: "Stable",
    },
    announcement: {
      up: "higher than the yearly ranking",
      down: "lower than the yearly ranking",
      new: "new since the yearly ranking",
      stable: "the same position as the yearly ranking",
    },
  },
  stats: {
    rankedTracks: "Ranked tracks",
    uniqueArtists: "Unique artists",
    uniqueAlbums: "Unique albums",
    averageDuration: "Avg. length · explicit",
  },
  insights: {
    title: "Ranking insights",
    subtitle: "Patterns from your current ranking.",
    sharedInAllRanges: {
      tracks: "Tracks in all three ranges",
      artists: "Artists in all three ranges",
    } satisfies Record<ListeningType, string>,
    currentItems: "Current ranked items",
    releaseYearsPrefix: "Release years in current top",
    noReleaseYears: "No release-date data available.",
  },
  exports: {
    title: "Export",
    subtitle: "Choose a scope and file format.",
    current: "Full current ranking",
    complete: "Complete data",
    formatCsv: "CSV",
    formatJson: "JSON",
  },
} as const;

export function rankingTitle(type: ListeningType): string {
  return CONTENT.ranking.title[type];
}

export function rangeLabel(range: TimeRange, short = false): string {
  return short
    ? CONTENT.range[range].short
    : CONTENT.range[range].long;
}

export function formatPlaceCount(count: number): string {
  return `${count} ${count === 1 ? "place" : "places"}`;
}

export function trendCopy(trend: Trend): {
  label: string;
  announcement: string;
} {
  switch (trend.direction) {
    case "up":
      return {
        label: `${CONTENT.trend.label.up} ${trend.places}`,
        announcement: `${formatPlaceCount(trend.places)} ${CONTENT.trend.announcement.up}`,
      };
    case "down":
      return {
        label: `${CONTENT.trend.label.down} ${trend.places}`,
        announcement: `${formatPlaceCount(trend.places)} ${CONTENT.trend.announcement.down}`,
      };
    case "new":
      return {
        label: CONTENT.trend.label.new,
        announcement: CONTENT.trend.announcement.new,
      };
    case "stable":
      return {
        label: CONTENT.trend.label.stable,
        announcement: CONTENT.trend.announcement.stable,
      };
  }
}
