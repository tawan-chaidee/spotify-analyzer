<script lang="ts">
  import type { Snippet } from "svelte";
  import { CONTENT } from "../services/content";

  type Props = {
    actions?: Snippet;
  };

  let { actions }: Props = $props();
</script>

<header class="mb-9 flex flex-wrap items-center justify-between gap-4">
  <div class="flex items-center gap-3 font-extrabold tracking-[-0.03em]">
    <span
      class="grid size-9 place-items-center rounded-full bg-highlight text-xs font-black text-on-highlight"
    >
      {CONTENT.app.logo}
    </span>
    <span>{CONTENT.app.name}</span>
  </div>

  {#if actions}
    <div class="flex flex-wrap items-center justify-end gap-2">
      {@render actions()}
    </div>
  {/if}
</header>
