<script lang="ts">
  import type {
    ListeningData,
    RankingType,
    TimeRange,
  } from "../models/listening";
  import {
    CONTENT,
    rangeLabel,
    rankingTitle,
  } from "../services/content";
  import {
    createCompleteCsv,
    createCompleteJson,
    createCurrentCsv,
    createCurrentJson,
    downloadExport,
    type ExportFile,
  } from "../services/export";
  import Button from "./Button.svelte";
  import Panel from "./Panel.svelte";

  type Props = {
    data: ListeningData;
    type: RankingType;
    range: TimeRange;
    currentCount: number;
    totalCount: number;
  };

  let {
    data,
    type,
    range,
    currentCount,
    totalCount,
  }: Props = $props();
  const currentLabel = $derived(rankingTitle(type));

  function run(factory: () => ExportFile) {
    downloadExport(factory());
  }
</script>

<Panel title={CONTENT.exports.title} subtitle={CONTENT.exports.subtitle}>
  <div class="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2">
    <span></span>
    <span
      class="text-center text-[10px] font-extrabold uppercase tracking-widest text-muted"
    >
      {CONTENT.exports.formatCsv}
    </span>
    <span
      class="text-center text-[10px] font-extrabold uppercase tracking-widest text-muted"
    >
      {CONTENT.exports.formatJson}
    </span>

    <span class="min-w-0 border-t border-line py-3">
      <strong class="block text-sm">{CONTENT.exports.current}</strong>
      <span class="mt-1 block truncate text-[11px] text-muted">
        {currentLabel} · {rangeLabel(range)} · {currentCount} rows
      </span>
    </span>
    <span class="border-t border-line py-3">
      <Button
        variant="secondary"
        size="compact"
        ariaLabel={`${CONTENT.exports.formatCsv}: ${CONTENT.exports.current}`}
        class="w-full px-2"
        onclick={() => run(() => createCurrentCsv(data, type, range))}
      >
        {CONTENT.exports.formatCsv}
      </Button>
    </span>
    <span class="border-t border-line py-3">
      <Button
        variant="secondary"
        size="compact"
        ariaLabel={`${CONTENT.exports.formatJson}: ${CONTENT.exports.current}`}
        class="w-full px-2"
        onclick={() => run(() => createCurrentJson(data, type, range))}
      >
        {CONTENT.exports.formatJson}
      </Button>
    </span>

    <span class="min-w-0 border-t border-line py-3">
      <strong class="block text-sm">{CONTENT.exports.complete}</strong>
      <span class="mt-1 block truncate text-[11px] text-muted">
        Tracks and artists · 3 ranges · {totalCount} rows
      </span>
    </span>
    <span class="border-t border-line py-3">
      <Button
        variant="secondary"
        size="compact"
        ariaLabel={`${CONTENT.exports.formatCsv}: ${CONTENT.exports.complete}`}
        class="w-full px-2"
        onclick={() => run(() => createCompleteCsv(data))}
      >
        {CONTENT.exports.formatCsv}
      </Button>
    </span>
    <span class="border-t border-line py-3">
      <Button
        variant="secondary"
        size="compact"
        ariaLabel={`${CONTENT.exports.formatJson}: ${CONTENT.exports.complete}`}
        class="w-full px-2"
        onclick={() => run(() => createCompleteJson(data))}
      >
        {CONTENT.exports.formatJson}
      </Button>
    </span>
  </div>
</Panel>
