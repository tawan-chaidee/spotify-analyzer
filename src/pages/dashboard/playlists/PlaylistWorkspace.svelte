<script lang="ts">
  import type {
    PlaylistSummary,
    PlaylistTrack,
  } from "../../../models/playlist";
  import { CONTENT } from "../../../services/content";
  import PlaylistBrowser from "./PlaylistBrowser.svelte";
  import PlaylistDetails from "./PlaylistDetails.svelte";
  import PlaylistExportPanel from "./PlaylistExportPanel.svelte";

  type Props = {
    playlists: PlaylistSummary[];
    visiblePlaylists: PlaylistSummary[];
    selectedPlaylistId: string | null;
    tracks: PlaylistTrack[];
    loading: boolean;
    tracksLoading: boolean;
    error: string;
    tracksError: string;
    needsPermission: boolean;
    onselect: (playlistId: string) => void;
    onretry: () => void;
    onreconnect: () => void;
  };

  let {
    playlists,
    visiblePlaylists,
    selectedPlaylistId,
    tracks,
    loading,
    tracksLoading,
    error,
    tracksError,
    needsPermission,
    onselect,
    onretry,
    onreconnect,
  }: Props = $props();

  const selected = $derived(
    playlists.find((playlist) => playlist.id === selectedPlaylistId),
  );
</script>

<section aria-labelledby="playlist-library-title">
  <div class="mb-4">
    <h2
      id="playlist-library-title"
      class="m-0 text-[clamp(2rem,4vw,3.5rem)] leading-[0.98] tracking-[-0.06em]"
    >
      {CONTENT.playlists.title}
    </h2>
    <p class="mb-0 mt-3 max-w-2xl text-muted">
      {CONTENT.playlists.subtitle}
    </p>
  </div>

  <div class="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
    <PlaylistBrowser
      playlists={visiblePlaylists}
      {selectedPlaylistId}
      {loading}
      {error}
      {needsPermission}
      {onselect}
      {onretry}
      {onreconnect}
    />

    <aside class="grid content-start gap-4">
      <PlaylistDetails
        {selected}
        {tracks}
        {tracksLoading}
        {tracksError}
        {needsPermission}
        {onselect}
        {onreconnect}
      />
      <PlaylistExportPanel
        {playlists}
        {selected}
        {tracks}
        {tracksLoading}
      />
    </aside>
  </div>
</section>
