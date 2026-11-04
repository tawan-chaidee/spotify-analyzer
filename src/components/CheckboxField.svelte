<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "../utils/cn";

  type Props = {
    checked: boolean;
    onchange: (checked: boolean) => void;
    disabled?: boolean;
    class?: string;
    children: Snippet;
    description?: Snippet;
  };

  let {
    checked,
    onchange,
    disabled = false,
    class: className,
    children,
    description,
  }: Props = $props();

  const id = $props.id();
  const descriptionId = `${id}-description`;
</script>

<label
  for={id}
  class={cn(
    "flex items-start gap-2.5 text-sm leading-relaxed text-muted",
    className,
  )}
>
  <input
    {id}
    type="checkbox"
    {checked}
    {disabled}
    aria-describedby={description ? descriptionId : undefined}
    onchange={(event) => onchange(event.currentTarget.checked)}
    class="mt-1 accent-highlight"
  />
  <span>
    {@render children()}
    {#if description}
      <span id={descriptionId} class="mt-1 block text-xs">
        {@render description()}
      </span>
    {/if}
  </span>
</label>
