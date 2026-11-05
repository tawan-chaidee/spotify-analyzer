<script lang="ts">
  import type {
    PlaylistFilter,
    PlaylistSort,
    PlaylistSummary,
    PlaylistTrack,
  } from "../models/playlist";
  import { CONTENT } from "../services/content";
  import {
    downloadExport,
    type ExportFile,
  } from "../services/export";
  import {
    createPlaylistLibraryCsv,
    createPlaylistLibraryJson,
    createPlaylistTracksCsv,
    createPlaylistTracksJson,
  } from "../services/playlist-export";
  import { cn } from "../utils/cn";
  import { formatDuration } from "../utils/format";
  import { safeSpotifyUrl } from "../utils/url";
  import Artwork from "./Artwork.svelte";
  import Button from "./Button.svelte";
  import Card from "./Card.svelte";
  import Panel from "./Panel.svelte";
  import Selector from "./Selector.svelte";

  type Props = {
    playlists: PlaylistSummary[];
    selectedPlaylistId: string | null;
    tracks: PlaylistTrack[];
    loading: boolean;
    tracksLoading: boolean;
    error: string;
    tracksError: string;
    needsPermission: boolean;
    onselect: (playlistId: string) => void;
    onretry: () => void;
    onreconnect: () => void;
  };

  let {
    playlists,
    selectedPlaylistId,
    tracks,
    loading,
    tracksLoading,
    error,
    tracksError,
    needsPermission,
    onselect,
    onretry,
    onreconnect,
  }: Props = $props();

  let query = $state("");
  let filter = $state<PlaylistFilter>("all");
  let sort = $state<PlaylistSort>("spotify");
  let exportScope = $state<"playlist" | "library">("playlist");

  const selected = $derived(
    playlists.find((playlist) => playlist.id === selectedPlaylistId),
  );
  const visiblePlaylists = $derived.by(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = playlists.filter((playlist) => {
      if (filter === "owned" && !playlist.isOwned) return false;
      if (filter === "followed" && playlist.isOwned) return false;
      if (!normalizedQuery) return true;
      return `${playlist.name} ${playlist.ownerName}`
        .toLowerCase()
        .includes(normalizedQuery);
    });

    if (sort === "name") {
      return filtered.sort((left, right) =>
        left.name.localeCompare(right.name),
      );
    }
    if (sort === "tracks") {
      return filtered.sort(
        (left, right) => right.trackCount - left.trackCount,
      );
    }
    return filtered;
  });
  const visibleTracks = $derived(tracks.slice(0, 100));
  const selectedUrl = $derived(
    selected ? safeSpotifyUrl(selected.spotifyUrl) : null,
  );

  function run(file: ExportFile) {
    downloadExport(file);
  }
</script>

<section aria-labelledby="playlist-library-title">
  <div class="mb-4">
    <h2
      id="playlist-library-title"
      class="m-0 text-[clamp(2rem,4vw,3.5rem)] leading-[0.98] tracking-[-0.06em]"
    >
      {CONTENT.playlists.title}
    </h2>
    <p class="mb-0 mt-3 max-w-2xl text-muted">
      {CONTENT.playlists.subtitle}
    </p>
  </div>

  <div class="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
    <Panel
      title={CONTENT.playlists.listTitle}
      subtitle={`${playlists.length} ${
        playlists.length === 1 ? "playlist" : "playlists"
      }`}
      dataComponent="playlist-list"
    >
      <div class="mb-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <label class="min-w-0">
          <span class="sr-only">{CONTENT.playlists.searchLabel}</span>
          <input
            bind:value={query}
            type="search"
            class="min-h-11 w-full rounded-control border border-line bg-main px-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-highlight"
            placeholder={CONTENT.playlists.searchPlaceholder}
          />
        </label>
        <label>
          <span class="sr-only">{CONTENT.playlists.filterLabel}</span>
          <select
            bind:value={filter}
            class="min-h-11 w-full rounded-control border border-line bg-main px-3 text-sm font-bold text-foreground outline-none focus:border-highlight"
          >
            <option value="all">{CONTENT.playlists.filter.all}</option>
            <option value="owned">{CONTENT.playlists.filter.owned}</option>
            <option value="followed">
              {CONTENT.playlists.filter.followed}
            </option>
          </select>
        </label>
        <label>
          <span class="sr-only">{CONTENT.playlists.sortLabel}</span>
          <select
            bind:value={sort}
            class="min-h-11 w-full rounded-control border border-line bg-main px-3 text-sm font-bold text-foreground outline-none focus:border-highlight"
          >
            <option value="spotify">{CONTENT.playlists.sort.spotify}</option>
            <option value="name">{CONTENT.playlists.sort.name}</option>
            <option value="tracks">{CONTENT.playlists.sort.tracks}</option>
          </select>
        </label>
      </div>

      {#if loading && playlists.length === 0}
        <p role="status" class="py-8 text-center text-sm text-muted">
          {CONTENT.playlists.loading}
        </p>
      {:else if error}
        <Card tone="highlight" class="p-4">
          <p role="alert" class="m-0 text-sm leading-relaxed text-muted">
            {error}
          </p>
          <Button
            variant={needsPermission ? "primary" : "secondary"}
            class="mt-3"
            onclick={needsPermission ? onreconnect : onretry}
          >
            {needsPermission
              ? CONTENT.playlists.reconnect
              : CONTENT.playlists.retry}
          </Button>
        </Card>
      {:else if visiblePlaylists.length === 0}
        <p role="status" class="py-8 text-center text-sm text-muted">
          {CONTENT.playlists.empty}
        </p>
      {:else}
        <ul class="m-0 grid list-none gap-1.5 p-0">
          {#each visiblePlaylists as playlist (playlist.id)}
            <li>
              <button
                type="button"
                aria-pressed={selectedPlaylistId === playlist.id}
                class={cn(
                  "grid w-full grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3",
                  "rounded-control p-2 text-left text-inherit transition-colors",
                  "hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2",
                  "focus-visible:outline-highlight",
                  selectedPlaylistId === playlist.id && "bg-foreground/[0.07]",
                )}
                onclick={() => onselect(playlist.id)}
              >
                <Artwork
                  src={playlist.imageUrl}
                  title={playlist.name}
                  class="size-12"
                />
                <span class="min-w-0">
                  <strong class="block truncate">{playlist.name}</strong>
                  <span class="mt-1 block truncate text-xs text-muted">
                    {CONTENT.playlists.ownerPrefix} {playlist.ownerName}
                    {playlist.isCollaborative
                      ? ` · ${CONTENT.playlists.collaborative}`
                      : ""}
                  </span>
                </span>
                <span class="text-right text-xs tabular-nums text-muted">
                  <strong class="block text-sm text-foreground">
                    {playlist.trackCount}
                  </strong>
                  {CONTENT.playlists.trackCount}
                </span>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </Panel>

    <aside class="grid content-start gap-4">
      <Panel
        title={selected?.name || CONTENT.playlists.selectTitle}
        subtitle={selected
          ? `${CONTENT.playlists.ownerPrefix} ${selected.ownerName}`
          : undefined}
      >
        {#if !selected}
          <p class="m-0 py-6 text-center text-sm text-muted">
            {CONTENT.playlists.selectDescription}
          </p>
        {:else}
          <div class="flex items-start gap-4">
            <Artwork
              src={selected.imageUrl}
              title={selected.name}
              class="size-20"
            />
            <div class="min-w-0">
              {#if selected.description}
                <p class="mt-0 line-clamp-3 text-sm leading-relaxed text-muted">
                  {selected.description}
                </p>
              {/if}
              <div class="flex flex-wrap gap-1.5">
                <span class="rounded-pill bg-foreground/5 px-2 py-1 text-[10px] font-bold text-muted">
                  {selected.isPublic
                    ? CONTENT.playlists.public
                    : CONTENT.playlists.private}
                </span>
                <span class="rounded-pill bg-foreground/5 px-2 py-1 text-[10px] font-bold text-muted">
                  {selected.trackCount} {CONTENT.playlists.trackCount}
                </span>
              </div>
            </div>
          </div>

          {#if selectedUrl}
            <Button
              href={selectedUrl}
              external
              variant="secondary"
              block
              class="mt-4"
            >
              {CONTENT.playlists.openSpotify}
            </Button>
          {/if}

          <div class="mt-5 flex items-center justify-between gap-3">
            <h3 class="m-0 text-sm font-bold">
              {CONTENT.playlists.tracksTitle}
            </h3>
            <span class="text-xs text-muted">
              {tracks.length} {CONTENT.playlists.trackCount}
            </span>
          </div>

          {#if tracksLoading}
            <p role="status" class="my-4 text-sm text-muted">
              {CONTENT.playlists.loadingTracks}
            </p>
          {:else if tracksError}
            <p
              role="alert"
              class="my-4 text-sm"
              class:text-danger={selected.isOwned ||
                selected.isCollaborative ||
                needsPermission}
              class:text-muted={!selected.isOwned &&
                !selected.isCollaborative &&
                !needsPermission}
            >
              {tracksError}
            </p>
            {#if needsPermission || selected.isOwned || selected.isCollaborative}
              <Button
                variant={needsPermission ? "primary" : "secondary"}
                size="compact"
                onclick={needsPermission
                  ? onreconnect
                  : () => onselect(selected.id)}
              >
                {needsPermission
                  ? CONTENT.playlists.reconnect
                  : CONTENT.playlists.retry}
              </Button>
            {/if}
          {:else if visibleTracks.length === 0}
            <p class="my-4 text-sm text-muted">
              {CONTENT.playlists.empty}
            </p>
          {:else}
            <ol class="m-0 mt-2 grid list-none gap-1 p-0">
              {#each visibleTracks as track, index (`${index}:${track.id}`)}
                <li
                  class="grid grid-cols-[1.5rem_2.5rem_minmax(0,1fr)] items-center gap-2 rounded-control p-1.5"
                >
                  <span class="text-right text-xs tabular-nums text-muted">
                    {index + 1}
                  </span>
                  <Artwork
                    src={track.album.imageUrl}
                    title={track.album.title}
                    class="size-10"
                  />
                  <span class="min-w-0">
                    <span class="block truncate text-sm font-bold">
                      {track.title}
                    </span>
                    <span class="mt-0.5 block truncate text-xs text-muted">
                      {track.artistNames.join(", ")} · {formatDuration(
                        track.durationMs,
                      )}
                    </span>
                  </span>
                </li>
              {/each}
            </ol>
            {#if tracks.length > visibleTracks.length}
              <p class="mb-0 mt-3 text-xs leading-relaxed text-muted">
                {CONTENT.playlists.firstTracksHint}
              </p>
            {/if}
          {/if}
        {/if}
      </Panel>

      <Panel title={CONTENT.playlists.exportTitle}>
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
            onchange={(value) =>
              (exportScope = value as "playlist" | "library")}
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
              disabled={playlists.length === 0}
              ariaLabel={`${CONTENT.exports.formatCsv}: ${CONTENT.playlists.libraryExport}`}
              onclick={() => run(createPlaylistLibraryCsv(playlists))}
            >
              CSV
            </Button>
            <Button
              variant="secondary"
              size="compact"
              disabled={playlists.length === 0}
              ariaLabel={`${CONTENT.exports.formatJson}: ${CONTENT.playlists.libraryExport}`}
              onclick={() => run(createPlaylistLibraryJson(playlists))}
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
              disabled={tracksLoading || tracks.length === 0}
              ariaLabel={`${CONTENT.exports.formatCsv}: ${CONTENT.playlists.playlistExport}`}
              onclick={() =>
                run(createPlaylistTracksCsv(selected, tracks))}
            >
              CSV
            </Button>
            <Button
              variant="secondary"
              size="compact"
              disabled={tracksLoading || tracks.length === 0}
              ariaLabel={`${CONTENT.exports.formatJson}: ${CONTENT.playlists.playlistExport}`}
              onclick={() =>
                run(createPlaylistTracksJson(selected, tracks))}
            >
              JSON
            </Button>
          </div>
        {:else}
          <p class="m-0 text-sm leading-relaxed text-muted">
            {CONTENT.playlists.playlistExportEmpty}
          </p>
        {/if}
      </Panel>
    </aside>
  </div>
</section>
