<script lang="ts">
  import PageLayout from "../shell/PageLayout.svelte";
  import { CONTENT } from "../services/content";
  import { smallLabelClass } from "../ui/styles";
</script>

<PageLayout>
  <section
    class="grid min-h-[65vh] place-items-center py-10"
    aria-labelledby="startup-title"
    aria-busy="true"
  >
    <div class="max-w-2xl text-center">
      <span
        class="mx-auto mb-6 block size-3 rounded-full bg-highlight motion-safe:animate-pulse"
        aria-hidden="true"
      ></span>
      <p class={`${smallLabelClass} mb-3.5 mt-0`}>
        {CONTENT.startup.label}
      </p>
      <h1
        id="startup-title"
        class="m-0 text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-[-0.075em]"
      >
        {CONTENT.startup.title}
      </h1>
      <p
        role="status"
        aria-live="polite"
        class="mx-auto mb-0 mt-4 max-w-lg text-muted"
      >
        {CONTENT.startup.description}
      </p>
    </div>
  </section>
</PageLayout>
