<script lang="ts">
  import type {
    PlaylistFilter,
    PlaylistSort,
  } from "../../../models/playlist";
  import { CONTENT } from "../../../services/content";

  type Props = {
    query: string;
    filter: PlaylistFilter;
    sort: PlaylistSort;
    onquerychange: (query: string) => void;
    onfilterchange: (filter: PlaylistFilter) => void;
    onsortchange: (sort: PlaylistSort) => void;
  };

  let {
    query,
    filter,
    sort,
    onquerychange,
    onfilterchange,
    onsortchange,
  }: Props = $props();
</script>

<div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
  <label class="min-w-0">
    <span class="sr-only">{CONTENT.playlists.searchLabel}</span>
    <input
      value={query}
      oninput={(event) =>
        onquerychange(event.currentTarget.value)}
      type="search"
      class="min-h-11 w-full rounded-control border border-line bg-main px-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-highlight"
      placeholder={CONTENT.playlists.searchPlaceholder}
    />
  </label>
  <label>
    <span class="sr-only">{CONTENT.playlists.filterLabel}</span>
    <select
      value={filter}
      onchange={(event) =>
        onfilterchange(event.currentTarget.value as PlaylistFilter)}
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
      value={sort}
      onchange={(event) =>
        onsortchange(event.currentTarget.value as PlaylistSort)}
      class="min-h-11 w-full rounded-control border border-line bg-main px-3 text-sm font-bold text-foreground outline-none focus:border-highlight"
    >
      <option value="spotify">{CONTENT.playlists.sort.spotify}</option>
      <option value="name">{CONTENT.playlists.sort.name}</option>
      <option value="tracks">{CONTENT.playlists.sort.tracks}</option>
    </select>
  </label>
</div>
