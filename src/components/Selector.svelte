<script lang="ts">
  import { cn } from "../utils/cn";

  type Option = {
    value: string;
    label: string;
  };

  type Props = {
    label: string;
    value: string;
    options: readonly Option[];
    onchange: (value: string) => void;
  };

  let { label, value, options, onchange }: Props = $props();
</script>

<div
  role="group"
  aria-label={label}
  class="inline-flex rounded-pill border border-line bg-main p-1"
>
  {#each options as option (option.value)}
    {@const selected = option.value === value}
    <button
      type="button"
      aria-pressed={selected}
      onclick={() => onchange(option.value)}
      class={cn(
        "min-h-11 flex-1 rounded-pill px-3 text-center text-sm font-bold transition-colors sm:px-4",
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
