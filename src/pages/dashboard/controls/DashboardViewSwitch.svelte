<script lang="ts">
  import type { DashboardView } from "../../../models/playlist";
  import { CONTENT } from "../../../services/content";
  import { cn } from "../../../utils/cn";

  type Props = {
    view: DashboardView;
    onchange: (view: DashboardView) => void;
  };

  let { view, onchange }: Props = $props();
</script>

<div
  class="inline-flex max-w-full rounded-pill border border-line bg-main/80 p-1 max-sm:w-full"
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
        "min-h-10 whitespace-nowrap rounded-pill px-4 py-2 text-sm font-extrabold transition-colors",
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
