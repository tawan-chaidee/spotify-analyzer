<script lang="ts">
  import type {
    DashboardSelection,
    InsightModel,
  } from "../models/dashboard";
  import { CONTENT } from "../services/content";
  import Panel from "./Panel.svelte";

  type Props = {
    insights: InsightModel;
    selection: DashboardSelection;
  };

  let { insights, selection }: Props = $props();
</script>

<Panel
  title={CONTENT.insights.title}
  subtitle={CONTENT.insights.subtitle}
>
  <div>
    <div
      class="flex justify-between gap-4 border-b border-line py-2.5 text-sm"
    >
      <span class="text-muted">
        {CONTENT.insights.sharedInAllRanges[selection.type]}
      </span>
      <strong>{insights.sharedItemCount}</strong>
    </div>
    <div
      class="flex justify-between gap-4 border-b border-line py-2.5 text-sm"
    >
      <span class="text-muted">{CONTENT.insights.currentItems}</span>
      <strong>{insights.currentItemCount}</strong>
    </div>

    {#if selection.type === "tracks"}
      <div
        class="mt-4 flex justify-between gap-4 border-b border-line py-2.5 text-sm"
      >
        <span class="text-muted">
          {CONTENT.insights.releaseYearsPrefix}
          {insights.currentItemCount}
        </span>
      </div>
      {#if insights.releaseYears.length}
        {#each insights.releaseYears as item (item.year)}
          <div
            class="my-2 grid grid-cols-[3rem_1fr_2rem] items-center gap-2 text-xs text-muted"
          >
            <span>{item.year}</span>
            <span class="h-1.5 overflow-hidden rounded-full bg-highlight/15">
              <i
                class="block h-full rounded-full bg-highlight"
                style={`width: ${item.percentage}%`}
              ></i>
            </span>
            <strong class="text-right">{item.count}</strong>
          </div>
        {/each}
      {:else}
        <p class="text-sm text-muted">
          {CONTENT.insights.noReleaseYears}
        </p>
      {/if}
    {/if}
  </div>
</Panel>
