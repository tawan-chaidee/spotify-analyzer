<script lang="ts">
  import type {
    ListeningType,
    TimeRange,
  } from "../models/listening";
  import { CONTENT } from "../services/content";
  import {
    contentTypeOptions,
    timeRangeOptions,
  } from "./selector-options";
  import Selector from "./Selector.svelte";

  type Props = {
    type: ListeningType;
    range: TimeRange;
    ontypechange: (type: ListeningType) => void;
    onrangechange: (range: TimeRange) => void;
  };

  let { type, range, ontypechange, onrangechange }: Props = $props();
</script>

<div class="mb-6 mt-5 flex flex-wrap gap-2.5">
  <Selector
    label={CONTENT.controls.contentLabel}
    value={type}
    options={contentTypeOptions}
    onchange={(value) => ontypechange(value as ListeningType)}
  />
  <Selector
    label={CONTENT.controls.rangeLabel}
    value={range}
    options={timeRangeOptions}
    onchange={(value) => onrangechange(value as TimeRange)}
  />
</div>
