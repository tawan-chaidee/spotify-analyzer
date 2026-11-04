<script lang="ts">
  import type { RankingRow as RankingRowModel } from "../models/listening";
  import { CONTENT } from "../services/content";
  import { cn } from "../utils/cn";
  import { safeSpotifyUrl } from "../utils/url";
  import Artwork from "./Artwork.svelte";
  import TrendStatus from "./TrendStatus.svelte";

  type Props = {
    row: RankingRowModel;
    showTrend: boolean;
  };

  let { row, showTrend }: Props = $props();
  const spotifyUrl = $derived(safeSpotifyUrl(row.spotifyUrl));
  const rowClass = $derived(
    cn(
      "grid min-h-14 items-center gap-2 rounded-xl p-2 text-inherit no-underline",
      "motion-safe:transition-colors hover:bg-foreground/5 active:bg-foreground/10",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight",
      "sm:gap-3",
      showTrend
        ? "grid-cols-[1.5rem_2.5rem_minmax(0,1fr)_3.25rem] sm:grid-cols-[1.75rem_3rem_minmax(0,1fr)_3.5rem]"
        : "grid-cols-[1.5rem_2.5rem_minmax(0,1fr)] sm:grid-cols-[1.75rem_3rem_minmax(0,1fr)_1.5rem]",
    ),
  );
</script>

{#snippet content()}
  <span class="text-right text-sm text-muted tabular-nums">
    <span class="sr-only">{CONTENT.ranking.rank} </span>
    {row.rank}
  </span>
  <Artwork
    src={row.imageUrl}
    title={row.title}
    class="size-10 sm:size-12"
  />
  <span class="min-w-0">
    <span class="block truncate font-bold">{row.title}</span>
    <span class="mt-1 block truncate text-xs text-muted sm:text-[13px]">
      {row.subtitle}
    </span>
  </span>
  {#if showTrend && row.trend}
    <TrendStatus trend={row.trend} />
  {:else}
    <span aria-hidden="true" class="text-muted max-[559px]:hidden">
      ↗
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
