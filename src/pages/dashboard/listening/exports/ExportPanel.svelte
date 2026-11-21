<script lang="ts">
  import type {
    ListeningData,
    RankingType,
    TimeRange,
  } from "../../../../models/listening";
  import {
    CONTENT,
    rangeLabel,
    rankingTitle,
  } from "../../../../services/content";
  import {
    createCompleteCsv,
    createCompleteJson,
    createCurrentCsv,
    createCurrentJson,
    downloadAndCopyExport,
    type ExportFile,
  } from "../../../../services/export";
  import Button from "../../../../ui/components/Button.svelte";
  import InlineFeedback from "../../../../ui/components/InlineFeedback.svelte";
  import Panel from "../../../../ui/components/Panel.svelte";
  import type { FeedbackKind } from "../../../../ui/styles";

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
  let activeAction = $state("");
  let actionStatus = $state("");
  let actionKind = $state<FeedbackKind>("success");

  async function run(factory: () => ExportFile, action: string) {
    activeAction = action;
    actionKind = "info";
    actionStatus = CONTENT.exports.preparing;
    try {
      const result = await downloadAndCopyExport(factory());
      actionKind = result === "copied" ? "success" : "warning";
      actionStatus =
        result === "copied"
          ? CONTENT.exports.copiedAndDownloaded
          : CONTENT.exports.downloadedClipboardUnavailable;
    } catch (error) {
      actionKind = "error";
      actionStatus =
        error instanceof Error ? error.message : "Unable to export this file.";
    } finally {
      activeAction = "";
    }
  }
</script>

<Panel
  title={CONTENT.exports.title}
  subtitle={`${CONTENT.exports.subtitle} ${CONTENT.exports.actionHint}`}
>
  <div class="grid gap-2.5">
    <div
      class="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 rounded-control bg-main/35 p-3"
    >
      <span class="min-w-0">
      <strong class="block text-sm">{CONTENT.exports.current}</strong>
      <span class="mt-1 block truncate text-[11px] text-muted">
        {currentLabel} · {rangeLabel(range)} · {currentCount} rows
      </span>
      </span>
      <Button
        variant="secondary"
        size="compact"
        ariaLabel={`Download and copy ${CONTENT.exports.formatCsv}: ${CONTENT.exports.current}`}
        loading={activeAction === "current-csv"}
        loadingLabel={CONTENT.exports.preparing}
        class="w-full px-2"
        onclick={() =>
          void run(
            () => createCurrentCsv(data, type, range),
            "current-csv",
          )}
      >
        {CONTENT.exports.formatCsv}
      </Button>
      <Button
        variant="secondary"
        size="compact"
        ariaLabel={`Download and copy ${CONTENT.exports.formatJson}: ${CONTENT.exports.current}`}
        loading={activeAction === "current-json"}
        loadingLabel={CONTENT.exports.preparing}
        class="w-full px-2"
        onclick={() =>
          void run(
            () => createCurrentJson(data, type, range),
            "current-json",
          )}
      >
        {CONTENT.exports.formatJson}
      </Button>
    </div>

    <div
      class="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 rounded-control bg-main/35 p-3"
    >
      <span class="min-w-0">
      <strong class="block text-sm">{CONTENT.exports.complete}</strong>
      <span class="mt-1 block truncate text-[11px] text-muted">
        Tracks and artists · 3 ranges · {totalCount} rows
      </span>
      </span>
      <Button
        variant="secondary"
        size="compact"
        ariaLabel={`Download and copy ${CONTENT.exports.formatCsv}: ${CONTENT.exports.complete}`}
        loading={activeAction === "complete-csv"}
        loadingLabel={CONTENT.exports.preparing}
        class="w-full px-2"
        onclick={() =>
          void run(() => createCompleteCsv(data), "complete-csv")}
      >
        {CONTENT.exports.formatCsv}
      </Button>
      <Button
        variant="secondary"
        size="compact"
        ariaLabel={`Download and copy ${CONTENT.exports.formatJson}: ${CONTENT.exports.complete}`}
        loading={activeAction === "complete-json"}
        loadingLabel={CONTENT.exports.preparing}
        class="w-full px-2"
        onclick={() =>
          void run(() => createCompleteJson(data), "complete-json")}
      >
        {CONTENT.exports.formatJson}
      </Button>
    </div>
  </div>
  <InlineFeedback
    kind={actionKind}
    message={actionStatus}
    class="mt-3"
  />
</Panel>
