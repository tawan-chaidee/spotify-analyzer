<script lang="ts">
  import type { Snippet } from "svelte";
  import Card from "./Card.svelte";

  type Props = {
    title: string;
    subtitle?: string;
    action?: Snippet;
    dataComponent?: string;
    children: Snippet;
  };

  let {
    title,
    subtitle,
    action,
    dataComponent,
    children,
  }: Props = $props();
</script>

<Card
  padding="md"
  dataComponent={dataComponent}
>
  <div class="flex items-start justify-between gap-3">
    <div>
      <h2 class="m-0 text-lg font-bold sm:text-xl">{title}</h2>
      {#if subtitle}
        <p class="mb-4 mt-1.5 text-sm text-muted">{subtitle}</p>
      {:else}
        <div class="mb-4"></div>
      {/if}
    </div>
    {#if action}
      {@render action()}
    {/if}
  </div>
  {@render children()}
</Card>
