<script lang="ts">
  import { CONTENT } from "../services/content";
</script>

<aside
  class="mb-5 rounded-control border border-highlight/20 bg-highlight/[0.055] p-3.5"
  aria-labelledby="album-ranking-method-title"
>
  <div class="mb-2 flex items-center justify-between gap-3">
    <h3 id="album-ranking-method-title" class="m-0 text-sm font-bold">
      {CONTENT.ranking.albumMethod.title}
    </h3>
    <span
      class="rounded-pill border border-highlight/25 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-highlight"
    >
      {CONTENT.ranking.albumMethod.badge}
    </span>
  </div>
  <p class="mb-3 mt-0 text-xs leading-relaxed text-muted">
    {CONTENT.ranking.albumMethod.description}
  </p>
  <code
    class="mb-3 block rounded-control border border-line bg-main/50 px-3 py-2 text-[11px] text-foreground"
  >
    {CONTENT.ranking.albumMethod.formula}
  </code>
  <p class="mb-1.5 mt-0 text-[11px] leading-relaxed text-muted">
    {CONTENT.ranking.albumMethod.coverage}
  </p>
  <p class="m-0 text-[11px] leading-relaxed text-muted">
    {CONTENT.ranking.albumMethod.movement}
  </p>
</aside>
