<script lang="ts">
  import type {
    RankingType,
    TimeRange,
  } from "../../../models/listening";
  import { CONTENT } from "../../../services/content";
  import Selector from "../../../ui/components/Selector.svelte";
  import {
    contentTypeOptions,
    timeRangeOptions,
  } from "./selector-options";

  type Props = {
    type: RankingType;
    range: TimeRange;
    ontypechange: (type: RankingType) => void;
    onrangechange: (range: TimeRange) => void;
  };

  let { type, range, ontypechange, onrangechange }: Props = $props();
</script>

<div class="flex flex-wrap gap-2.5">
  <Selector
    label={CONTENT.controls.contentLabel}
    value={type}
    options={contentTypeOptions}
    onchange={(value) => ontypechange(value as RankingType)}
  />
  <Selector
    label={CONTENT.controls.rangeLabel}
    value={range}
    options={timeRangeOptions}
    onchange={(value) => onrangechange(value as TimeRange)}
  />
</div>
