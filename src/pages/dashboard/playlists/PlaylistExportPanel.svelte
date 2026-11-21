<script lang="ts">
  import type {
    PlaylistSummary,
    PlaylistTrack,
  } from "../../../models/playlist";
  import { CONTENT } from "../../../services/content";
  import {
    downloadAndCopyExport,
    type ExportFile,
  } from "../../../services/export";
  import {
    createPlaylistLibraryCsv,
    createPlaylistLibraryJson,
    createPlaylistTracksCsv,
    createPlaylistTracksJson,
  } from "../../../services/playlist-export";
  import Button from "../../../ui/components/Button.svelte";
  import InlineFeedback from "../../../ui/components/InlineFeedback.svelte";
  import Panel from "../../../ui/components/Panel.svelte";
  import Selector from "../../../ui/components/Selector.svelte";
  import type { FeedbackKind } from "../../../ui/styles";

  type Props = {
    playlists: PlaylistSummary[];
    selected: PlaylistSummary | undefined;
    tracks: PlaylistTrack[];
    tracksLoading: boolean;
  };

  let {
    playlists,
    selected,
    tracks,
    tracksLoading,
  }: Props = $props();

  let exportScope = $state<"playlist" | "library">("playlist");
  let exportAction = $state("");
  let exportStatus = $state("");
  let exportKind = $state<FeedbackKind>("success");

  async function run(file: ExportFile, action: string) {
    exportAction = action;
    exportKind = "info";
    exportStatus = CONTENT.exports.preparing;
    try {
      const result = await downloadAndCopyExport(file);
      exportKind = result === "copied" ? "success" : "warning";
      exportStatus =
        result === "copied"
          ? CONTENT.exports.copiedAndDownloaded
          : CONTENT.exports.downloadedClipboardUnavailable;
    } catch (error) {
      exportKind = "error";
      exportStatus =
        error instanceof Error ? error.message : "Unable to export this file.";
    } finally {
      exportAction = "";
    }
  }
</script>

<Panel
  title={CONTENT.playlists.exportTitle}
  subtitle={CONTENT.exports.actionHint}
>
  <div class="mb-4">
    <Selector
      label={CONTENT.playlists.exportScopeLabel}
      value={exportScope}
      options={[
        {
          value: "playlist",
          label: CONTENT.playlists.exportScope.playlist,
        },
        {
          value: "library",
          label: CONTENT.playlists.exportScope.library,
        },
      ]}
      onchange={(value) => {
        exportScope = value as "playlist" | "library";
        exportStatus = "";
      }}
    />
  </div>

  {#if exportScope === "library"}
    <p class="mb-3 mt-0 text-sm leading-relaxed text-muted">
      {CONTENT.playlists.libraryExportDescription}
    </p>
    <div class="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        size="compact"
        disabled={playlists.length === 0 || Boolean(exportAction)}
        loading={exportAction === "library-csv"}
        loadingLabel={CONTENT.exports.preparing}
        ariaLabel={`Download and copy ${CONTENT.exports.formatCsv}: ${CONTENT.playlists.libraryExport}`}
        onclick={() =>
          void run(createPlaylistLibraryCsv(playlists), "library-csv")}
      >
        CSV
      </Button>
      <Button
        variant="secondary"
        size="compact"
        disabled={playlists.length === 0 || Boolean(exportAction)}
        loading={exportAction === "library-json"}
        loadingLabel={CONTENT.exports.preparing}
        ariaLabel={`Download and copy ${CONTENT.exports.formatJson}: ${CONTENT.playlists.libraryExport}`}
        onclick={() =>
          void run(createPlaylistLibraryJson(playlists), "library-json")}
      >
        JSON
      </Button>
    </div>
  {:else if selected}
    <p class="mb-3 mt-0 text-sm leading-relaxed text-muted">
      {CONTENT.playlists.playlistExportDescription}
    </p>
    <div class="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        size="compact"
        disabled={
          tracksLoading || tracks.length === 0 || Boolean(exportAction)
        }
        loading={exportAction === "playlist-csv"}
        loadingLabel={CONTENT.exports.preparing}
        ariaLabel={`Download and copy ${CONTENT.exports.formatCsv}: ${CONTENT.playlists.playlistExport}`}
        onclick={() =>
          void run(createPlaylistTracksCsv(selected, tracks), "playlist-csv")}
      >
        CSV
      </Button>
      <Button
        variant="secondary"
        size="compact"
        disabled={
          tracksLoading || tracks.length === 0 || Boolean(exportAction)
        }
        loading={exportAction === "playlist-json"}
        loadingLabel={CONTENT.exports.preparing}
        ariaLabel={`Download and copy ${CONTENT.exports.formatJson}: ${CONTENT.playlists.playlistExport}`}
        onclick={() =>
          void run(createPlaylistTracksJson(selected, tracks), "playlist-json")}
      >
        JSON
      </Button>
    </div>
  {:else}
    <p class="m-0 text-sm leading-relaxed text-muted">
      {CONTENT.playlists.playlistExportEmpty}
    </p>
  {/if}
  <InlineFeedback
    kind={exportKind}
    message={exportStatus}
    class="mt-3"
  />
</Panel>
