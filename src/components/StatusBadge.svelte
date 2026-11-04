<script lang="ts">
  import type { Snippet } from "svelte";
  import {
    statusBadgeClass,
    type StatusTone,
  } from "../ui/styles";

  type Props = {
    tone?: StatusTone;
    look?: "plain" | "soft";
    title?: string;
    announcement?: string;
    role?: "status";
    class?: string;
    children: Snippet;
  };

  let {
    tone = "neutral",
    look = "plain",
    title,
    announcement,
    role,
    class: className,
    children,
  }: Props = $props();
</script>

<span
  {title}
  {role}
  class={statusBadgeClass({ tone, soft: look === "soft", className })}
>
  {@render children()}
  {#if announcement}<span class="sr-only">{announcement}</span>{/if}
</span>
