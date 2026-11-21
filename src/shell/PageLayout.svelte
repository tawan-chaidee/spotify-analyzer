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
    class="relative z-10 mx-auto w-[min(1320px,calc(100%-32px))] py-5 pb-12 max-[560px]:w-[calc(100%-22px)] max-[560px]:py-3"
  >
    <div
      class="border border-line/80 bg-main/55 px-6 py-6 max-[560px]:px-4 max-[560px]:py-4"
    >
      <PageHeader {actions} />
      {@render children()}
    </div>
  </div>
</div>
