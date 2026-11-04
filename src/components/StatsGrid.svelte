<script lang="ts">
  import type { StatCard, StatMetric } from "../models/dashboard";
  import { CONTENT } from "../services/content";
  import Card from "./Card.svelte";

  type Props = {
    stats: StatCard[];
  };

  let { stats }: Props = $props();

  const labels: Record<StatMetric, string> = {
    rankedTracks: CONTENT.stats.rankedTracks,
    uniqueArtists: CONTENT.stats.uniqueArtists,
    uniqueAlbums: CONTENT.stats.uniqueAlbums,
    averageDuration: CONTENT.stats.averageDuration,
  };
</script>

<div class="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
  {#each stats as stat (stat.metric)}
    <Card padding="sm">
      <strong class="mb-1 block text-2xl tracking-[-0.04em]">
        {stat.value}
      </strong>
      <span class="text-xs text-muted">{labels[stat.metric]}</span>
    </Card>
  {/each}
</div>
