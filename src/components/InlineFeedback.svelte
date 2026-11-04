<script lang="ts">
  import type { Snippet } from "svelte";
  import {
    feedbackClass,
    type FeedbackKind,
  } from "../ui/styles";

  type Props = {
    kind?: FeedbackKind;
    message?: string;
    action?: Snippet;
    class?: string;
    children?: Snippet;
  };

  let {
    kind = "info",
    message,
    action,
    class: className,
    children,
  }: Props = $props();
</script>

{#if message || children || action}
  <div
    role={kind === "error" ? "alert" : "status"}
    class={feedbackClass(kind, className)}
  >
    <div class="flex flex-wrap items-center justify-between gap-2">
      <span>
        {message}
        {#if children}{@render children()}{/if}
      </span>
      {#if action}{@render action()}{/if}
    </div>
  </div>
{/if}
