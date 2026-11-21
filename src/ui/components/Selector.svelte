<script lang="ts">
  import { cn } from "../../utils/cn";
  import type { ChoiceOption } from "./types";

  type Props = {
    label: string;
    value: string;
    options: readonly ChoiceOption[];
    onchange: (value: string) => void;
  };

  let { label, value, options, onchange }: Props = $props();
</script>

<div
  data-component="selector"
  role="group"
  aria-label={label}
  class="inline-flex max-w-full rounded-pill border border-line bg-main/80 p-1 max-sm:w-full"
>
  {#each options as option (option.value)}
    {@const selected = option.value === value}
    <button
      type="button"
      aria-pressed={selected}
      onclick={() => onchange(option.value)}
      class={cn(
        "min-h-10 flex-1 whitespace-nowrap rounded-pill px-3 text-center text-sm font-bold transition-colors sm:px-4",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight",
        selected
          ? "bg-highlight text-on-highlight"
          : "text-muted hover:text-foreground",
      )}
    >
      {option.label}
    </button>
  {/each}
</div>
