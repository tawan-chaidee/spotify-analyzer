<script lang="ts">
  import type {
    PlaylistFilter,
    PlaylistSort,
  } from "../../../models/playlist";
  import { CONTENT } from "../../../services/content";
  import DropdownSelect from "../../../ui/components/DropdownSelect.svelte";

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

<div
  data-component="playlist-filters"
  class="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(11rem,auto)_minmax(11rem,auto)]"
>
  <label class="min-w-0 sm:col-span-2 lg:col-span-1">
    <span class="sr-only">{CONTENT.playlists.searchLabel}</span>
    <input
      value={query}
      oninput={(event) =>
        onquerychange(event.currentTarget.value)}
      type="search"
      class="min-h-12 w-full rounded-pill border border-line bg-main px-3.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-highlight"
      placeholder={CONTENT.playlists.searchPlaceholder}
    />
  </label>
  <DropdownSelect
    label={CONTENT.playlists.filterLabel}
    value={filter}
    options={[
      { value: "all", label: CONTENT.playlists.filter.all },
      { value: "owned", label: CONTENT.playlists.filter.owned },
      { value: "followed", label: CONTENT.playlists.filter.followed },
    ]}
    onchange={(value) => onfilterchange(value as PlaylistFilter)}
  />
  <DropdownSelect
    label={CONTENT.playlists.sortLabel}
    value={sort}
    options={[
      { value: "spotify", label: CONTENT.playlists.sort.spotify },
      { value: "name", label: CONTENT.playlists.sort.name },
      { value: "tracks", label: CONTENT.playlists.sort.tracks },
    ]}
    onchange={(value) => onsortchange(value as PlaylistSort)}
  />
</div>
