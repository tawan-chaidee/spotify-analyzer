<script lang="ts">
  import type { DashboardView } from "../models/playlist";
  import { CONTENT } from "../services/content";
  import { cn } from "../utils/cn";

  type Props = {
    view: DashboardView;
    onchange: (view: DashboardView) => void;
  };

  let { view, onchange }: Props = $props();
</script>

<div
  class="mb-5 inline-flex rounded-pill border border-line bg-secondary p-1"
  role="group"
  aria-label={CONTENT.views.label}
>
  {#each [
    { value: "listening", label: CONTENT.views.listening },
    { value: "playlists", label: CONTENT.views.playlists },
  ] as option (option.value)}
    {@const active = view === option.value}
    <button
      type="button"
      aria-pressed={active}
      class={cn(
        "rounded-pill px-4 py-2 text-sm font-extrabold transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight",
        active
          ? "bg-foreground text-main"
          : "text-muted hover:text-foreground",
      )}
      onclick={() => onchange(option.value as DashboardView)}
    >
      {option.label}
    </button>
  {/each}
</div>
