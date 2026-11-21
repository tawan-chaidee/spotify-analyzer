<script lang="ts">
  import type { PlaylistSummary } from "../../../models/playlist";
  import { CONTENT } from "../../../services/content";
  import { cn } from "../../../utils/cn";
  import Artwork from "../../../ui/components/Artwork.svelte";
  import Button from "../../../ui/components/Button.svelte";
  import Panel from "../../../ui/components/Panel.svelte";

  type Props = {
    playlists: PlaylistSummary[];
    selectedPlaylistId: string | null;
    loading: boolean;
    error: string;
    needsPermission: boolean;
    onselect: (playlistId: string) => void;
    onretry: () => void;
    onreconnect: () => void;
  };

  let {
    playlists,
    selectedPlaylistId,
    loading,
    error,
    needsPermission,
    onselect,
    onretry,
    onreconnect,
  }: Props = $props();
</script>

<Panel
  title={CONTENT.playlists.listTitle}
  subtitle={`${playlists.length} ${
    playlists.length === 1 ? "playlist" : "playlists"
  }`}
  dataComponent="playlist-list"
>
  {#if loading && playlists.length === 0}
    <p role="status" class="py-8 text-center text-sm text-muted">
      {CONTENT.playlists.loading}
    </p>
  {:else if error}
    <div class="rounded-control border border-highlight/20 bg-highlight/[0.06] p-4">
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
    </div>
  {:else if playlists.length === 0}
    <p role="status" class="py-8 text-center text-sm text-muted">
      {CONTENT.playlists.empty}
    </p>
  {:else}
    <ul class="m-0 grid list-none gap-2 p-0">
      {#each playlists as playlist (playlist.id)}
        <li>
          <button
            type="button"
            aria-pressed={selectedPlaylistId === playlist.id}
            class={cn(
              "grid w-full grid-cols-[3.25rem_minmax(0,1fr)_auto] items-center gap-3",
              "rounded-control border border-line/70 bg-main/30 p-3 text-left text-inherit transition-colors",
              "hover:border-foreground/20 hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2",
              "focus-visible:outline-highlight",
              selectedPlaylistId === playlist.id &&
                "border-highlight/30 bg-foreground/[0.07]",
            )}
            onclick={() => onselect(playlist.id)}
          >
            <Artwork
              src={playlist.imageUrl}
              title={playlist.name}
              class="size-[52px]"
            />
            <span class="min-w-0">
              <strong class="line-clamp-2 text-[15px] leading-snug">
                {playlist.name}
              </strong>
              <span class="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                {CONTENT.playlists.ownerPrefix} {playlist.ownerName}
                {playlist.isCollaborative
                  ? ` · ${CONTENT.playlists.collaborative}`
                  : ""}
              </span>
            </span>
            <span class="self-start text-right text-xs tabular-nums text-muted">
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
