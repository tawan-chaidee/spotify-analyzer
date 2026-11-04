<script lang="ts">
  import type { Snippet } from "svelte";
  import {
    buttonClass,
    type ButtonSize,
    type ButtonVariant,
  } from "../ui/styles";

  type Props = {
    variant?: ButtonVariant;
    size?: ButtonSize;
    block?: boolean;
    loading?: boolean;
    loadingLabel?: string;
    href?: string;
    external?: boolean;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    onclick?: (event: MouseEvent) => void;
    ariaLabel?: string;
    class?: string;
    children: Snippet;
  };

  let {
    variant = "secondary",
    size = "default",
    block = false,
    loading = false,
    loadingLabel,
    href,
    external = false,
    type = "button",
    disabled = false,
    onclick,
    ariaLabel,
    class: className,
    children,
  }: Props = $props();

  const classes = $derived(
    buttonClass({ variant, size, block, className }),
  );
</script>

{#if href}
  <a
    {href}
    {onclick}
    aria-label={ariaLabel}
    class={classes}
    target={external ? "_blank" : undefined}
    rel={external ? "noopener noreferrer" : undefined}
    aria-disabled={disabled || undefined}
  >
    {@render children()}
    {#if external}<span class="sr-only"> Opens in a new tab.</span>{/if}
  </a>
{:else}
  <button
    {type}
    {onclick}
    aria-label={loading ? loadingLabel || ariaLabel : ariaLabel}
    class={classes}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
  >
    {@render children()}
  </button>
{/if}
