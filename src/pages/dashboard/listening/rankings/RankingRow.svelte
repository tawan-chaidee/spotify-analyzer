<script lang="ts">
  import type { RankingRow as RankingRowModel } from "../../../../models/listening";
  import { CONTENT } from "../../../../services/content";
  import Artwork from "../../../../ui/components/Artwork.svelte";
  import { cn } from "../../../../utils/cn";
  import { safeSpotifyUrl } from "../../../../utils/url";
  import TrendStatus from "./TrendStatus.svelte";

  type Props = {
    row: RankingRowModel;
    showTrend: boolean;
  };

  let { row, showTrend }: Props = $props();
  const spotifyUrl = $derived(safeSpotifyUrl(row.spotifyUrl));
  const rowClass = $derived(
    cn(
      "grid min-h-[4.75rem] items-center gap-3 border-b border-line/70 p-3 text-inherit no-underline last:border-b-0",
      "motion-safe:transition-colors hover:bg-foreground/5 active:bg-foreground/10",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight",
      showTrend
        ? "grid-cols-[2rem_2.75rem_minmax(0,1fr)_3.5rem] sm:grid-cols-[2rem_3rem_minmax(0,1fr)_4rem]"
        : "grid-cols-[2rem_2.75rem_minmax(0,1fr)] sm:grid-cols-[2rem_3rem_minmax(0,1fr)]",
    ),
  );
</script>

{#snippet trendContent()}
  {#if showTrend && row.trend}
    <TrendStatus trend={row.trend} />
  {:else if showTrend}
    <span aria-hidden="true" class="text-muted">↗</span>
  {/if}
{/snippet}

{#snippet content()}
  <span class="grid size-7 place-items-center justify-self-center text-[12px] font-bold tabular-nums text-foreground">
    <span class="sr-only">{CONTENT.ranking.rank} </span>
    {row.rank}
  </span>
  <Artwork
    src={row.imageUrl}
    title={row.title}
    class="size-11 self-center sm:size-12"
  />
  <span class="min-w-0">
    <span class="line-clamp-2 text-[15px] font-bold leading-snug">
      {row.title}
    </span>
    <span class="mt-1 line-clamp-2 text-xs leading-relaxed text-muted sm:text-[13px]">
      {row.subtitle}
    </span>
  </span>
    {#if showTrend}
      <span class="justify-self-end">
      {@render trendContent()}
    </span>
  {/if}
{/snippet}

<li>
  {#if spotifyUrl}
    <a
      href={spotifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      class={rowClass}
    >
      {@render content()}
      <span class="sr-only">{CONTENT.ranking.spotifyLink}</span>
    </a>
  {:else}
    <div class={rowClass}>
      {@render content()}
    </div>
  {/if}
</li>
