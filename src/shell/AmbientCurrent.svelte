<script lang="ts">
</script>

<svg
  class="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[min(780px,90vh)] w-full text-highlight"
  viewBox="0 0 1440 780"
  preserveAspectRatio="xMidYMin slice"
  aria-hidden="true"
>
  <defs>
    <linearGradient id="current-fade" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="currentColor" stop-opacity="0" />
      <stop offset=".2" stop-color="currentColor" stop-opacity=".22" />
      <stop offset=".52" stop-color="currentColor" stop-opacity=".7" />
      <stop offset="1" stop-color="currentColor" stop-opacity="0" />
    </linearGradient>
    <filter id="signal-glow" x="-10%" y="-60%" width="120%" height="220%">
      <feGaussianBlur stdDeviation="5" />
    </filter>
  </defs>

  <g
    fill="none"
    stroke="url(#current-fade)"
    stroke-linecap="round"
    opacity=".26"
    filter="url(#signal-glow)"
    vector-effect="non-scaling-stroke"
  >
    <path d="M-80 164C145 38 269 244 474 124S774 -1 1050 132s278 39 486-62" stroke-width="3" />
    <path d="M-80 200C145 74 269 280 474 160S774 35 1050 168s278 39 486-62" stroke-width="2" />
  </g>

  <g
    fill="none"
    stroke="url(#current-fade)"
    stroke-linecap="round"
    vector-effect="non-scaling-stroke"
  >
    <path d="M-80 164C145 38 269 244 474 124S774 -1 1050 132s278 39 486-62" stroke-width="1.7" />
    <path d="M-80 200C145 74 269 280 474 160S774 35 1050 168s278 39 486-62" opacity=".82" stroke-width="1.25" />
    <path d="M-80 236C145 110 269 316 474 196S774 71 1050 204s278 39 486-62" opacity=".62" />
    <path d="M-80 272C145 146 269 352 474 232S774 107 1050 240s278 39 486-62" opacity=".42" />
  </g>

</svg>
