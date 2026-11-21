<script lang="ts">
  import type {
    DashboardMode,
    DashboardModel,
  } from "../../models/dashboard";
  import type {
    ListeningData,
    RankingType,
    TimeRange,
  } from "../../models/listening";
  import type {
    DashboardView,
    PlaylistFilter,
    PlaylistSort,
    PlaylistSummary,
    PlaylistTrack,
  } from "../../models/playlist";
  import { CONTENT } from "../../services/content";
  import { filterAndSortPlaylists } from "../../services/playlist-view";
  import PageLayout from "../../shell/PageLayout.svelte";
  import Button from "../../ui/components/Button.svelte";
  import StatusBadge from "../../ui/components/StatusBadge.svelte";
  import DashboardSelectors from "./controls/DashboardSelectors.svelte";
  import ListeningWorkspace from "./listening/ListeningWorkspace.svelte";
  import PlaylistWorkspace from "./playlists/PlaylistWorkspace.svelte";

  type Props = {
    model: DashboardModel;
    data: ListeningData;
    mode: DashboardMode;
    busy: boolean;
    status: string;
    view: DashboardView;
    playlists: PlaylistSummary[];
    selectedPlaylistId: string | null;
    playlistTracks: PlaylistTrack[];
    playlistsLoading: boolean;
    playlistTracksLoading: boolean;
    playlistsError: string;
    playlistTracksError: string;
    playlistsNeedPermission: boolean;
    playlistQuery: string;
    playlistFilter: PlaylistFilter;
    playlistSort: PlaylistSort;
    ontypechange: (type: RankingType) => void;
    onrangechange: (range: TimeRange) => void;
    onviewchange: (view: DashboardView) => void;
    onplaylistselect: (playlistId: string) => void;
    onplaylistretry: () => void;
    onplaylistreconnect: () => void;
    onplaylistquerychange: (query: string) => void;
    onplaylistfilterchange: (filter: PlaylistFilter) => void;
    onplaylistsortchange: (sort: PlaylistSort) => void;
    onshare?: () => void;
    ondisconnect?: () => void;
    onowntaste?: () => void;
  };

  let {
    model,
    data,
    mode,
    busy,
    status,
    view,
    playlists,
    selectedPlaylistId,
    playlistTracks,
    playlistsLoading,
    playlistTracksLoading,
    playlistsError,
    playlistTracksError,
    playlistsNeedPermission,
    playlistQuery,
    playlistFilter,
    playlistSort,
    ontypechange,
    onrangechange,
    onviewchange,
    onplaylistselect,
    onplaylistretry,
    onplaylistreconnect,
    onplaylistquerychange,
    onplaylistfilterchange,
    onplaylistsortchange,
    onshare,
    ondisconnect,
    onowntaste,
  }: Props = $props();

  const visiblePlaylists = $derived(
    filterAndSortPlaylists(playlists, {
      query: playlistQuery,
      filter: playlistFilter,
      sort: playlistSort,
    }),
  );

</script>

{#snippet dashboardHeaderActions()}
  {#if status}
    <span role="status" class="min-w-0 text-xs font-semibold text-highlight">
      {status}
    </span>
  {:else if mode === "mock"}
    <StatusBadge tone="success" look="soft" role="status">
      {CONTENT.dashboard.mockBadge}
    </StatusBadge>
  {/if}

  {#if mode === "shared" && onowntaste}
    <Button
      href="./"
      variant="ghost"
      onclick={(event) => {
        event.preventDefault();
        onowntaste();
      }}
    >
      {CONTENT.dashboard.ownTaste}
    </Button>
  {/if}

  {#if mode !== "shared" && onshare}
    <Button variant="ghost" onclick={onshare}>
      {CONTENT.dashboard.share}
    </Button>
  {/if}

  {#if mode === "private" && ondisconnect}
    <Button variant="ghost" onclick={ondisconnect}>
      {CONTENT.dashboard.disconnect}
    </Button>
  {/if}
{/snippet}

<PageLayout actions={dashboardHeaderActions}>
  <section aria-busy={busy}>
    <DashboardSelectors
      {mode}
      {view}
      type={model.selection.type}
      range={model.selection.range}
      {playlistQuery}
      {playlistFilter}
      {playlistSort}
      {onviewchange}
      {ontypechange}
      {onrangechange}
      {onplaylistquerychange}
      {onplaylistfilterchange}
      {onplaylistsortchange}
    />

    {#if mode !== "shared" && view === "playlists"}
      <PlaylistWorkspace
        {playlists}
        {visiblePlaylists}
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
      <ListeningWorkspace {model} {data} {mode} />
    {/if}
  </section>
</PageLayout>
