<script lang="ts">
  import type {
    PlaylistSummary,
    PlaylistTrack,
  } from "../../../models/playlist";
  import { CONTENT } from "../../../services/content";
  import { safeSpotifyUrl } from "../../../utils/url";
  import Artwork from "../../../ui/components/Artwork.svelte";
  import Button from "../../../ui/components/Button.svelte";
  import Card from "../../../ui/components/Card.svelte";
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

<Card class="p-4 sm:p-5" dataComponent="playlist-details">
  {#if !selected}
    <h2 class="m-0 text-lg font-bold">{CONTENT.playlists.selectTitle}</h2>
    <p class="mb-0 mt-2 text-sm text-muted">
      {CONTENT.playlists.selectDescription}
    </p>
  {:else}
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <h2 class="m-0 line-clamp-2 text-xl font-bold tracking-[-0.03em]">
          {selected.name}
        </h2>
        <p class="mb-0 mt-1 text-sm text-muted">
          {CONTENT.playlists.ownerPrefix} {selected.ownerName}
        </p>
      </div>
      <span class="shrink-0 rounded-pill bg-foreground/5 px-2.5 py-1 text-[10px] font-bold text-muted">
        {selected.isPublic
          ? CONTENT.playlists.public
          : CONTENT.playlists.private}
      </span>
    </div>

    <div class="mt-4 flex items-start gap-4">
      <Artwork
        src={selected.imageUrl}
        title={selected.name}
        class="size-[84px]"
      />
      <div class="min-w-0">
        <p class="m-0 line-clamp-3 text-sm leading-relaxed text-muted">
          {selected.description || "No playlist description."}
        </p>
        <div class="mt-3 flex flex-wrap gap-1.5">
          <span class="rounded-pill border border-line px-2 py-1 text-[10px] font-bold text-muted">
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
</Card>
