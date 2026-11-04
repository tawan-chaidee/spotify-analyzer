<script lang="ts">
  import type { RankingListModel } from "../models/listening";
  import {
    CONTENT,
    rangeLabel,
    rankingTitle,
  } from "../services/content";
  import AlbumRankingMethod from "./AlbumRankingMethod.svelte";
  import Panel from "./Panel.svelte";
  import RankingRow from "./RankingRow.svelte";

  type Props = {
    model: RankingListModel;
  };

  let { model }: Props = $props();
  const subtitle = $derived(
    `${rangeLabel(model.range)} · ${CONTENT.ranking.showingPrefix} ${model.rows.length}${
      model.showTrend ? ` · ${CONTENT.ranking.movement}` : ""
    }`,
  );
</script>

<Panel
  title={rankingTitle(model.type)}
  {subtitle}
  dataComponent="ranking-list"
>
  {#if model.type === "albums"}
    <AlbumRankingMethod />
  {/if}
  <ol class="m-0 grid list-none gap-2 p-0">
    {#if model.rows.length === 0}
      <li role="status" class="px-2 py-6 text-center text-muted">
        {CONTENT.ranking.empty}
      </li>
    {:else}
      {#each model.rows as row (`${row.rank}:${row.id}`)}
        <RankingRow {row} showTrend={model.showTrend} />
      {/each}
    {/if}
  </ol>
</Panel>
