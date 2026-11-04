<script lang="ts">
  import { cn } from "../utils/cn";
  import { safeArtworkUrl } from "../utils/url";

  type Props = {
    src: string;
    title: string;
    class?: string;
    size?: number;
  };

  let {
    src,
    title,
    class: className,
    size = 48,
  }: Props = $props();

  let failed = $state(false);
  const source = $derived(safeArtworkUrl(src));

  $effect(() => {
    src;
    failed = false;
  });
</script>

{#if source && !failed}
  <img
    src={source}
    alt=""
    {title}
    width={size}
    height={size}
    loading="lazy"
    decoding="async"
    onerror={() => (failed = true)}
    class={cn(
      "shrink-0 rounded-lg bg-secondary object-cover",
      className,
    )}
  />
{:else}
  <span
    aria-hidden="true"
    class={cn("shrink-0 rounded-lg bg-secondary", className)}
  ></span>
{/if}
