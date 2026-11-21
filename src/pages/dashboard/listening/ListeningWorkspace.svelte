<script lang="ts">
  import type {
    DashboardMode,
    DashboardModel,
  } from "../../../models/dashboard";
  import type { ListeningData } from "../../../models/listening";
  import ExportPanel from "./exports/ExportPanel.svelte";
  import InsightsPanel from "./insights/InsightsPanel.svelte";
  import SpotlightGrid from "./overview/SpotlightGrid.svelte";
  import StatsGrid from "./overview/StatsGrid.svelte";
  import RankingList from "./rankings/RankingList.svelte";
  import WorkspaceHeading from "./WorkspaceHeading.svelte";

  type Props = {
    model: DashboardModel;
    data: ListeningData;
    mode: DashboardMode;
  };

  let { model, data, mode }: Props = $props();
  let heading = $state<HTMLHeadingElement | null>(null);

  $effect(() => {
    mode;
    heading?.focus();
  });
</script>

<WorkspaceHeading {mode} bind:heading />
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
