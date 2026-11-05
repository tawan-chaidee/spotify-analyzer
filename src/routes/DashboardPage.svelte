<script lang="ts">
  import type { DashboardMode } from "../models/app";
  import type { DashboardModel } from "../models/dashboard";
  import type {
    ListeningData,
    RankingType,
    TimeRange,
  } from "../models/listening";
  import type {
    DashboardView,
    PlaylistSummary,
    PlaylistTrack,
  } from "../models/playlist";
  import DashboardViewSwitch from "../components/DashboardViewSwitch.svelte";
  import DashboardHeader from "../components/DashboardHeader.svelte";
  import ExportPanel from "../components/ExportPanel.svelte";
  import InsightsPanel from "../components/InsightsPanel.svelte";
  import PlaylistLibrary from "../components/PlaylistLibrary.svelte";
  import RankingControls from "../components/RankingControls.svelte";
  import RankingList from "../components/RankingList.svelte";
  import SpotlightGrid from "../components/SpotlightGrid.svelte";
  import StatsGrid from "../components/StatsGrid.svelte";

  type Props = {
    model: DashboardModel;
    data: ListeningData;
    mode: DashboardMode;
    busy: boolean;
    view: DashboardView;
    playlists: PlaylistSummary[];
    selectedPlaylistId: string | null;
    playlistTracks: PlaylistTrack[];
    playlistsLoading: boolean;
    playlistTracksLoading: boolean;
    playlistsError: string;
    playlistTracksError: string;
    playlistsNeedPermission: boolean;
    ontypechange: (type: RankingType) => void;
    onrangechange: (range: TimeRange) => void;
    onviewchange: (view: DashboardView) => void;
    onplaylistselect: (playlistId: string) => void;
    onplaylistretry: () => void;
    onplaylistreconnect: () => void;
  };

  let {
    model,
    data,
    mode,
    busy,
    view,
    playlists,
    selectedPlaylistId,
    playlistTracks,
    playlistsLoading,
    playlistTracksLoading,
    playlistsError,
    playlistTracksError,
    playlistsNeedPermission,
    ontypechange,
    onrangechange,
    onviewchange,
    onplaylistselect,
    onplaylistretry,
    onplaylistreconnect,
  }: Props = $props();

  let heading = $state<HTMLHeadingElement | null>(null);

  $effect(() => {
    mode;
    heading?.focus();
  });
</script>

<section aria-busy={busy}>
  <DashboardHeader {mode} bind:heading />
  {#if mode !== "shared"}
    <DashboardViewSwitch
      view={view}
      onchange={onviewchange}
    />
  {/if}

  {#if mode !== "shared" && view === "playlists"}
    <PlaylistLibrary
      {playlists}
      {selectedPlaylistId}
      tracks={playlistTracks}
      loading={playlistsLoading}
      tracksLoading={playlistTracksLoading}
      error={playlistsError}
      tracksError={playlistTracksError}
      needsPermission={playlistsNeedPermission}
      onselect={onplaylistselect}
      onretry={onplaylistretry}
      onreconnect={onplaylistreconnect}
    />
  {:else}
    <RankingControls
      type={model.selection.type}
      range={model.selection.range}
      {ontypechange}
      {onrangechange}
    />
    <SpotlightGrid
      cards={model.spotlights}
      range={model.selection.range}
    />
    <StatsGrid stats={model.stats} />

    <div
      class="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,.55fr)]"
    >
      <RankingList model={model.ranking} />
      <aside class="grid content-start gap-4">
        <InsightsPanel
          insights={model.insights}
          selection={model.selection}
        />
        <ExportPanel
          {data}
          type={model.selection.type}
          range={model.selection.range}
          currentCount={model.exports.currentCount}
          totalCount={model.exports.totalCount}
        />
      </aside>
    </div>
  {/if}
</section>
