<script lang="ts">
  import type { Trend } from "../models/listening";
  import { trendCopy } from "../services/content";
  import type { StatusTone } from "../ui/styles";
  import StatusBadge from "./StatusBadge.svelte";

  type Props = {
    trend: Trend;
  };

  let { trend }: Props = $props();
  const text = $derived(trendCopy(trend));
  const tone = $derived<StatusTone>(
    trend.direction === "up"
      ? "success"
      : trend.direction === "down"
        ? "danger"
        : trend.direction === "new"
          ? "info"
          : "neutral",
  );
</script>

<StatusBadge
  title={text.announcement}
  {tone}
  announcement={text.announcement}
  class="min-w-12 justify-self-end text-[10px] uppercase tracking-wider tabular-nums sm:text-[11px]"
>
  <span aria-hidden="true">{text.label}</span>
</StatusBadge>
