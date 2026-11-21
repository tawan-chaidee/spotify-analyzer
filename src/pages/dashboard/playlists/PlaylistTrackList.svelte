<script lang="ts">
  import type {
    PlaylistSummary,
    PlaylistTrack,
  } from "../../../models/playlist";
  import { CONTENT } from "../../../services/content";
  import { formatDuration } from "../../../utils/format";
  import Artwork from "../../../ui/components/Artwork.svelte";
  import Button from "../../../ui/components/Button.svelte";

  type Props = {
    selected: PlaylistSummary;
    tracks: PlaylistTrack[];
    loading: boolean;
    error: string;
    needsPermission: boolean;
    onselect: (playlistId: string) => void;
    onreconnect: () => void;
  };

  let {
    selected,
    tracks,
    loading,
    error,
    needsPermission,
    onselect,
    onreconnect,
  }: Props = $props();

  const visibleTracks = $derived(tracks.slice(0, 100));
</script>

<div class="mt-6 flex items-center justify-between gap-3 border-b border-line pb-3">
  <h3 class="m-0 text-sm font-bold">{CONTENT.playlists.tracksTitle}</h3>
  <span class="text-xs text-muted">
    {tracks.length} {CONTENT.playlists.trackCount}
  </span>
</div>

{#if loading}
  <p role="status" class="my-4 text-sm text-muted">
    {CONTENT.playlists.loadingTracks}
  </p>
{:else if error}
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
    {error}
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
  <p class="my-4 text-sm text-muted">{CONTENT.playlists.empty}</p>
{:else}
  <ol class="m-0 grid list-none p-0">
    {#each visibleTracks as track, index (`${index}:${track.id}`)}
      <li
        class="grid min-h-[4.75rem] grid-cols-[1.75rem_3rem_minmax(0,1fr)] items-center gap-3 border-b border-line p-3.5 last:border-b-0"
      >
        <span class="grid size-7 place-items-center text-[12px] font-bold tabular-nums text-foreground">
          {index + 1}
        </span>
        <Artwork
          src={track.album.imageUrl}
          title={track.album.title}
          class="size-12"
        />
        <span class="min-w-0">
          <span class="line-clamp-2 text-[15px] font-bold leading-snug">
            {track.title}
          </span>
          <span class="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
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
