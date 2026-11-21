<script lang="ts">
  import type { SpotlightCard as SpotlightCardModel } from "../../../../models/dashboard";
  import type { TimeRange } from "../../../../models/listening";
  import {
    CONTENT,
    rangeLabel,
  } from "../../../../services/content";
  import Artwork from "../../../../ui/components/Artwork.svelte";
  import Card from "../../../../ui/components/Card.svelte";
  import { smallLabelClass } from "../../../../ui/styles";
  import { safeSpotifyUrl } from "../../../../utils/url";

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
    class="size-[68px] shadow-xl sm:size-[108px]"
  />
  <span class="min-w-0">
    <span class={`${smallLabelClass} mb-1.5 text-[10px] tracking-[0.08em] sm:mb-2 sm:text-[11px]`}>
      {kicker} · {rangeLabel(range)}
    </span>
    <span
      class="line-clamp-2 text-lg font-black leading-tight tracking-[-0.04em] sm:text-2xl"
    >
      {card.title}
    </span>
    <span class="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted sm:mt-2">
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
      class="grid min-h-[7rem] grid-cols-[68px_minmax(0,1fr)] items-center gap-3 p-3.5 text-inherit no-underline sm:min-h-35 sm:grid-cols-[108px_minmax(0,1fr)] sm:gap-5 sm:p-[18px]"
    >
      {@render content()}
    </a>
  {:else}
    <div
      class="grid min-h-[7rem] grid-cols-[68px_minmax(0,1fr)] items-center gap-3 p-3.5 sm:min-h-35 sm:grid-cols-[108px_minmax(0,1fr)] sm:gap-5 sm:p-[18px]"
    >
      {@render content()}
    </div>
  {/if}
</Card>
