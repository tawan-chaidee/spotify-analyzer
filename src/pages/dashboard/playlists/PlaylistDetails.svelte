<script lang="ts">
  import type {
    PlaylistSummary,
    PlaylistTrack,
  } from "../../../models/playlist";
  import { CONTENT } from "../../../services/content";
  import { safeSpotifyUrl } from "../../../utils/url";
  import Artwork from "../../../ui/components/Artwork.svelte";
  import Button from "../../../ui/components/Button.svelte";
  import Panel from "../../../ui/components/Panel.svelte";
  import PlaylistTrackList from "./PlaylistTrackList.svelte";

  type Props = {
    selected: PlaylistSummary | undefined;
    tracks: PlaylistTrack[];
    tracksLoading: boolean;
    tracksError: string;
    needsPermission: boolean;
    onselect: (playlistId: string) => void;
    onreconnect: () => void;
  };

  let {
    selected,
    tracks,
    tracksLoading,
    tracksError,
    needsPermission,
    onselect,
    onreconnect,
  }: Props = $props();

  const selectedUrl = $derived(
    selected ? safeSpotifyUrl(selected.spotifyUrl) : null,
  );
</script>

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

    <PlaylistTrackList
      {selected}
      {tracks}
      loading={tracksLoading}
      error={tracksError}
      {needsPermission}
      {onselect}
      {onreconnect}
    />
  {/if}
</Panel>
