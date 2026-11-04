<script lang="ts">
  import type { SpotlightCard as SpotlightCardModel } from "../models/dashboard";
  import type { TimeRange } from "../models/listening";
  import SpotlightCard from "./SpotlightCard.svelte";

  type Props = {
    cards: SpotlightCardModel[];
    range: TimeRange;
  };

  let { cards, range }: Props = $props();
</script>

<div class="mb-4 grid gap-4 md:grid-cols-2">
  {#each cards as card, index (`${card.kind}-${index}`)}
    <SpotlightCard {card} {range} />
  {/each}
</div>
