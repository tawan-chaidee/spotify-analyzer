<script lang="ts">
  import type { DashboardMode } from "../models/app";
  import { CONTENT } from "../services/content";
  import { smallLabelClass } from "../ui/styles";

  type Props = {
    mode: DashboardMode;
    heading?: HTMLHeadingElement | null;
  };

  let {
    mode,
    heading = $bindable(null),
  }: Props = $props();

  const shared = $derived(mode === "shared");
</script>

<div class="mb-6">
  <p class={`${smallLabelClass} mb-3.5 mt-0`}>
    {shared
      ? CONTENT.dashboard.sharedSectionLabel
      : CONTENT.dashboard.ownerSectionLabel}
  </p>
  <h1
    bind:this={heading}
    tabindex="-1"
    class="m-0 text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-[-0.075em] focus:outline-none"
  >
    {shared
      ? CONTENT.dashboard.sharedTitle
      : CONTENT.dashboard.ownerTitle}
  </h1>
  <p class="mb-0 mt-3 text-muted">
    {shared
      ? CONTENT.dashboard.sharedNote
      : CONTENT.dashboard.ownerNote}
  </p>
</div>
