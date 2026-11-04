<script lang="ts">
  import type { Snippet } from "svelte";
  import {
    cardClass,
    type CardPadding,
    type CardTone,
  } from "../ui/styles";

  type Props = {
    tone?: CardTone;
    padding?: CardPadding;
    dataComponent?: string;
    class?: string;
    children: Snippet;
  };

  let {
    tone = "default",
    padding = "none",
    dataComponent,
    class: className,
    children,
  }: Props = $props();
</script>

<div
  class={cardClass({ tone, padding, className })}
  data-component={dataComponent}
>
  {@render children()}
</div>
