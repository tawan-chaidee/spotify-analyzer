<script lang="ts">
  import type { DashboardMode } from "../../../models/dashboard";
  import type {
    RankingType,
    TimeRange,
  } from "../../../models/listening";
  import type {
    DashboardView,
    PlaylistFilter,
    PlaylistSort,
  } from "../../../models/playlist";
  import DashboardViewSwitch from "./DashboardViewSwitch.svelte";
  import ListeningSelectors from "./ListeningSelectors.svelte";
  import PlaylistSelectors from "./PlaylistSelectors.svelte";

  type Props = {
    mode: DashboardMode;
    view: DashboardView;
    type: RankingType;
    range: TimeRange;
    playlistQuery: string;
    playlistFilter: PlaylistFilter;
    playlistSort: PlaylistSort;
    onviewchange: (view: DashboardView) => void;
    ontypechange: (type: RankingType) => void;
    onrangechange: (range: TimeRange) => void;
    onplaylistquerychange: (query: string) => void;
    onplaylistfilterchange: (filter: PlaylistFilter) => void;
    onplaylistsortchange: (sort: PlaylistSort) => void;
  };

  let {
    mode,
    view,
    type,
    range,
    playlistQuery,
    playlistFilter,
    playlistSort,
    onviewchange,
    ontypechange,
    onrangechange,
    onplaylistquerychange,
    onplaylistfilterchange,
    onplaylistsortchange,
  }: Props = $props();
</script>

<div class="mb-6 mt-5 grid gap-2.5">
  {#if mode !== "shared"}
    <DashboardViewSwitch view={view} onchange={onviewchange} />
  {/if}

  {#if mode !== "shared" && view === "playlists"}
    <PlaylistSelectors
      query={playlistQuery}
      filter={playlistFilter}
      sort={playlistSort}
      onquerychange={onplaylistquerychange}
      onfilterchange={onplaylistfilterchange}
      onsortchange={onplaylistsortchange}
    />
  {:else}
    <ListeningSelectors
      {type}
      {range}
      {ontypechange}
      {onrangechange}
    />
  {/if}
</div>
