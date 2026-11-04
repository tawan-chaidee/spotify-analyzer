<script lang="ts">
  import type { SpotlightCard as SpotlightCardModel } from "../models/dashboard";
  import type { TimeRange } from "../models/listening";
  import { CONTENT, rangeLabel } from "../services/content";
  import { smallLabelClass } from "../ui/styles";
  import { safeSpotifyUrl } from "../utils/url";
  import Artwork from "./Artwork.svelte";
  import Card from "./Card.svelte";

  type Props = {
    card: SpotlightCardModel;
    range: TimeRange;
  };

  let { card, range }: Props = $props();
  const href = $derived(safeSpotifyUrl(card.spotifyUrl));
  const kicker = $derived(
    card.kind === "track"
      ? CONTENT.ranking.trackKicker
      : CONTENT.ranking.albumKicker,
  );
</script>

{#snippet content()}
  <Artwork
    src={card.imageUrl}
    title={card.title}
    size={108}
    class="size-20 shadow-2xl sm:size-[108px]"
  />
  <span class="min-w-0">
    <span class={`${smallLabelClass} mb-2 text-[11px] tracking-[0.1em]`}>
      {kicker} · {rangeLabel(range)}
    </span>
    <span
      class="block truncate text-xl font-black tracking-[-0.04em] sm:text-2xl"
    >
      {card.title}
    </span>
    <span class="mt-2 block truncate text-sm text-muted">
      {card.subtitle}
    </span>
  </span>
{/snippet}

<Card tone="interactive" class="overflow-hidden">
  {#if href}
    <a
      {href}
      target="_blank"
      rel="noopener noreferrer"
      class="grid min-h-35 grid-cols-[80px_minmax(0,1fr)] items-center gap-5 p-4 text-inherit no-underline sm:grid-cols-[108px_minmax(0,1fr)] sm:p-[18px]"
    >
      {@render content()}
    </a>
  {:else}
    <div
      class="grid min-h-35 grid-cols-[80px_minmax(0,1fr)] items-center gap-5 p-4 sm:grid-cols-[108px_minmax(0,1fr)] sm:p-[18px]"
    >
      {@render content()}
    </div>
  {/if}
</Card>
