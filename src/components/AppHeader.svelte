<script lang="ts">
  import type { DashboardMode } from "../models/app";
  import { CONTENT } from "../services/content";
  import Button from "./Button.svelte";
  import StatusBadge from "./StatusBadge.svelte";

  type Props = {
    mode: DashboardMode;
    status: string;
    isMock: boolean;
    onshare?: () => void;
    ondisconnect?: () => void;
    onowntaste?: () => void;
  };

  let {
    mode,
    status,
    isMock,
    onshare,
    ondisconnect,
    onowntaste,
  }: Props = $props();
</script>

<header class="mb-9 flex flex-wrap items-center justify-between gap-4">
  <div class="flex items-center gap-3 font-extrabold tracking-[-0.03em]">
    <span
      class="grid size-9 place-items-center rounded-full bg-highlight text-xs font-black text-on-highlight"
    >
      {CONTENT.app.logo}
    </span>
    <span>{CONTENT.app.name}</span>
  </div>

  <div class="flex flex-wrap items-center justify-end gap-2">
    {#if status}
      <span
        role="status"
        class="min-w-0 text-xs font-semibold text-highlight"
      >
        {status}
      </span>
    {:else if isMock}
      <StatusBadge tone="success" look="soft" role="status">
        {CONTENT.dashboard.mockBadge}
      </StatusBadge>
    {/if}

    {#if mode === "shared"}
      <Button
        href="./"
        variant="ghost"
        onclick={(event) => {
          if (!onowntaste) return;
          event.preventDefault();
          onowntaste();
        }}
      >
        {CONTENT.dashboard.ownTaste}
      </Button>
    {/if}

    {#if mode !== "shared" && onshare}
      <Button variant="ghost" onclick={onshare}>
        {CONTENT.dashboard.share}
      </Button>
    {/if}

    {#if mode === "private" && ondisconnect}
      <Button variant="ghost" onclick={ondisconnect}>
        {CONTENT.dashboard.disconnect}
      </Button>
    {/if}
  </div>
</header>
