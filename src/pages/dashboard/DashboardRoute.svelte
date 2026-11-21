<script lang="ts">
  import type { DashboardRuntime } from "../../features/dashboard/runtime";
  import type { DashboardMode } from "../../models/dashboard";
  import type {
    RankingType,
    TimeRange,
  } from "../../models/listening";
  import type {
    DashboardView,
    PlaylistFilter,
    PlaylistSort,
  } from "../../models/playlist";

  type Props = {
    runtime: DashboardRuntime;
    mode: DashboardMode;
    status: string;
    onshare: () => void;
    onplaylistreconnect: () => Promise<boolean>;
    ondisconnect?: () => void;
    onowntaste?: () => void;
  };

  let {
    runtime,
    mode,
    status,
    onshare,
    onplaylistreconnect,
    ondisconnect,
    onowntaste,
  }: Props = $props();

  const controller = $derived(runtime.controller);
  const DashboardPage = $derived(runtime.Page);
  const selectedPlaylistTracks = $derived.by(() => {
    if (!controller.selectedPlaylistId) return [];
    return controller.playlistTracks[controller.selectedPlaylistId] || [];
  });

  function setType(type: RankingType) {
    controller.setType(type);
  }

  function setRange(range: TimeRange) {
    controller.setRange(range);
  }

  function setView(view: DashboardView) {
    controller.setView(view);
  }

  function selectPlaylist(playlistId: string) {
    void controller.selectPlaylist(playlistId);
  }

  function retryPlaylists() {
    void controller.loadPlaylists();
  }

  function setPlaylistQuery(query: string) {
    controller.setPlaylistQuery(query);
  }

  function setPlaylistFilter(filter: PlaylistFilter) {
    controller.setPlaylistFilter(filter);
  }

  function setPlaylistSort(sort: PlaylistSort) {
    controller.setPlaylistSort(sort);
  }

  async function reconnectPlaylists() {
    if (await onplaylistreconnect()) {
      controller.setView("playlists");
    }
  }
</script>

<DashboardPage
  model={controller.model}
  data={controller.data}
  {mode}
  busy={controller.loading}
  {status}
  view={controller.view}
  playlists={controller.playlists}
  selectedPlaylistId={controller.selectedPlaylistId}
  playlistTracks={selectedPlaylistTracks}
  playlistsLoading={controller.playlistsLoading}
  playlistTracksLoading={controller.playlistTracksLoading}
  playlistsError={controller.playlistsError}
  playlistTracksError={controller.playlistTracksError}
  playlistsNeedPermission={controller.playlistsNeedPermission}
  playlistQuery={controller.playlistQuery}
  playlistFilter={controller.playlistFilter}
  playlistSort={controller.playlistSort}
  ontypechange={setType}
  onrangechange={setRange}
  onviewchange={setView}
  onplaylistselect={selectPlaylist}
  onplaylistretry={retryPlaylists}
  onplaylistreconnect={reconnectPlaylists}
  onplaylistquerychange={setPlaylistQuery}
  onplaylistfilterchange={setPlaylistFilter}
  onplaylistsortchange={setPlaylistSort}
  {onshare}
  {ondisconnect}
  {onowntaste}
/>
