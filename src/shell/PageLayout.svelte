<script lang="ts">
  import type { Snippet } from "svelte";
  import AmbientCurrent from "./AmbientCurrent.svelte";
  import PageHeader from "./PageHeader.svelte";

  type Props = {
    actions?: Snippet;
    children: Snippet;
  };

  let { actions, children }: Props = $props();
</script>

<div class="relative isolate min-h-screen overflow-x-clip">
  <AmbientCurrent />
  <div
    class="relative z-10 mx-auto w-[min(1180px,calc(100%-32px))] py-7 pb-14 max-[560px]:w-[calc(100%-22px)] max-[560px]:pt-4"
  >
    <PageHeader {actions} />
    {@render children()}
  </div>
</div>
