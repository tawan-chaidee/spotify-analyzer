import type {
  RankingType,
  TimeRange,
  Trend,
} from "../models/listening";

export const CONTENT = {
  app: {
    name: "Spotify Top Explorer",
    logo: "ST",
  },
  connection: {
    sectionLabel: "Spotify top-list explorer",
    title: "Your listening taste, ranked.",
    description:
      "Compare your top artists and tracks across the last four weeks, six months, and year. Export every ranking as CSV or JSON.",
    ownSectionLabel: "One-time setup",
    ownTitle: "Use Your Spotify App",
    ownDescription:
      "Create or choose your own Spotify Developer app. No downloading or deployment is required.",
    createTitle: "Create or open your Spotify app",
    createDescription:
      "On the Spotify Developer Dashboard, create an app or open one you already own.",
    createApp: "Create Spotify app",
    createAppUrl: "https://developer.spotify.com/dashboard/create",
    openDashboard: "Open dashboard",
    openDashboardUrl: "https://developer.spotify.com/dashboard",
    redirectTitle: "Add this redirect URI",
    redirectDescription:
      "Copy the full link into your Spotify app's Redirect URIs. Include the final slash.",
    copy: "Copy",
    copied: "Copied",
    copyFailed: "Could not copy. Select the link and copy it manually.",
    clientIdTitle: "Copy your Client ID",
    clientIdDescription:
      "Open your Spotify app, go to Settings, and copy the Client ID.",
    clientIdLabel: "Spotify Client ID",
    clientIdPlaceholder: "Paste the 32-character Client ID",
    invalidClientId:
      "That does not look like a Spotify Client ID. Check the value in your Spotify app settings.",
    clientIdPrivacy:
      "The Client ID is public. Never paste a Client Secret.",
    remember: "Keep me connected on this device. This stores Spotify tokens in this browser.",
    connect: "Connect Spotify",
    connecting: "Connecting…",
    readyTitle: "Ready to connect",
    readyDescription:
      "This app requests read-only access to your top artists, tracks, and playlists.",
    ownAppLabel: "Your Spotify app",
    ownerAppLabel: "Owner Spotify app",
    clientIdEnding: "Client ID ending",
    changeApp: "Change Spotify app",
    ownerAccess: "Owner Access",
    ownerDescription:
      "Uses this deployment's Spotify app. Approved accounts only.",
    redirectLabel: "Redirect URI",
    redirectUnavailable: "Unavailable when opened as a local file",
    initialMessage: "Set up your Spotify app to load your rankings.",
    readyMessage: "Your Spotify app is ready. Connect to load your rankings.",
    completing: "Completing Spotify authorization…",
    ownerForbidden:
      "This Spotify account is not approved for Owner Access. Use your own Spotify app instead.",
    ownForbidden:
      "Spotify rejected this app or account. Check that the account can use the Spotify app.",
  },
  dashboard: {
    ownerSectionLabel: "Spotify dashboard",
    ownerTitle: "Your listening, in one place.",
    ownerNote:
      "Explore your top-list charts and browse the playlists in your library.",
    sharedSectionLabel: "Shared with you",
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
  views: {
    label: "Dashboard view",
    listening: "Listening",
    playlists: "Playlists",
  },
  controls: {
    contentLabel: "Content type",
    rangeLabel: "Time range",
    tracks: "Tracks",
    artists: "Artists",
    albums: "Albums",
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
      albums: "Top albums",
    } satisfies Record<RankingType, string>,
    showingPrefix: "Showing all",
    movement: "Movement vs 1 year",
    empty: "No ranking data is available for this selection.",
    spotifyLink: "Opens Spotify in a new tab.",
    rank: "Rank",
    trackKicker: "#1 track",
    albumKicker: "Top album",
    artistMeta: "Spotify artist",
    albumMethod: {
      title: "How albums are ranked",
      badge: "Inferred",
      description:
        "Spotify does not provide a personal top-albums endpoint. Albums are inferred by grouping the tracks already present in your current top list.",
      formula: "score = Σ (N − track rank + 1)",
      coverage:
        "Only albums represented by at least one track in the selected top list are included. Deluxe editions remain separate.",
      movement:
        "Movement compares this inferential 6-month album ranking with the same calculation over your 1-year top tracks.",
    },
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
      albums: "Albums in all three ranges",
    } satisfies Record<RankingType, string>,
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
  playlists: {
    title: "Your playlist library",
    listTitle: "Playlists",
    subtitle:
      "Search your owned and followed playlists, inspect their tracks, and export the data.",
    searchLabel: "Search playlists",
    searchPlaceholder: "Search by name or owner",
    filterLabel: "Playlist access",
    filter: {
      all: "All",
      owned: "Owned",
      followed: "Followed",
    },
    sortLabel: "Sort playlists",
    sort: {
      spotify: "Spotify order",
      name: "Name",
      tracks: "Most tracks",
    },
    loading: "Loading your playlists…",
    loadingTracks: "Loading playlist tracks…",
    empty: "No playlists match these filters.",
    selectTitle: "Select a playlist",
    selectDescription:
      "Choose a playlist to inspect its tracks and export it.",
    ownerPrefix: "By",
    trackCount: "tracks",
    public: "Public",
    private: "Private",
    collaborative: "Collaborative",
    openSpotify: "Open in Spotify",
    detailTitle: "Playlist details",
    tracksTitle: "Playlist tracks",
    exportTitle: "Export",
    exportScopeLabel: "Export scope",
    exportScope: {
      playlist: "Selected playlist",
      library: "Playlist library",
    },
    libraryExport: "Playlist library",
    libraryExportDescription:
      "Download the playlist names, ownership, visibility, and track counts.",
    playlistExport: "Export selected playlist",
    playlistExportDescription:
      "Download the complete selected playlist in its original track order.",
    playlistExportEmpty:
      "Select a playlist first, or switch the export scope to the playlist library.",
    firstTracksHint:
      "The screen shows the first 100 tracks; exports include the complete playlist.",
    error: "Unable to load your playlists.",
    permission:
      "Reconnect Spotify to approve playlist access. Your existing listening data will stay available.",
    reconnect: "Reconnect for playlists",
    retry: "Try again",
    tracksError: "Unable to load this playlist's tracks.",
    followedTracksUnavailable:
      "Spotify only exposes track items for playlists you own or collaborate on. You can still export this playlist's metadata.",
  },
} as const;

export function rankingTitle(type: RankingType): string {
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
