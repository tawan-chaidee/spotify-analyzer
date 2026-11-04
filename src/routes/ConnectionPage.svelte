<script lang="ts">
  import ConnectionCard from "../components/ConnectionCard.svelte";
  import type { SelectedSpotifyApp } from "../models/auth";
  import { CONTENT } from "../services/content";
  import { smallLabelClass } from "../ui/styles";

  type Props = {
    selectedApp: SelectedSpotifyApp | null;
    ownerAvailable: boolean;
    initialClientId?: string;
    remember: boolean;
    redirectUri: string;
    message: string;
    isError: boolean;
    busy: boolean;
    onrememberchange: (value: boolean) => void;
    onconnect: () => void;
    onclientidsubmit: (clientId: string) => void;
    onowneraccess: () => void;
    onchangeapp: () => void;
  };

  let {
    selectedApp,
    ownerAvailable,
    initialClientId,
    remember,
    redirectUri,
    message,
    isError,
    busy,
    onrememberchange,
    onconnect,
    onclientidsubmit,
    onowneraccess,
    onchangeapp,
  }: Props = $props();
</script>

<section
  class="grid min-h-[58vh] items-center gap-9 py-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,.7fr)]"
>
  <div>
    <p class={`${smallLabelClass} mb-3.5 mt-0`}>
      {CONTENT.connection.sectionLabel}
    </p>
    <h1
      tabindex="-1"
      class="m-0 max-w-3xl text-[clamp(3rem,8vw,6.8rem)] leading-[0.93] tracking-[-0.075em] focus:outline-none"
    >
      {CONTENT.connection.title}
    </h1>
    <p class="mb-6 mt-6 max-w-2xl text-lg leading-relaxed text-muted">
      {CONTENT.connection.description}
    </p>
  </div>
  <ConnectionCard
    {selectedApp}
    {ownerAvailable}
    {initialClientId}
    {remember}
    {redirectUri}
    {message}
    {isError}
    {busy}
    {onrememberchange}
    {onconnect}
    {onclientidsubmit}
    {onowneraccess}
    {onchangeapp}
  />
</section>
