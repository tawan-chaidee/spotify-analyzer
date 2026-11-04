<script lang="ts">
  import { CONTENT } from "../services/content";
  import {
    isValidSpotifyClientId,
    normalizeSpotifyClientId,
  } from "../services/spotify-app";
  import { copyText } from "../services/sharing/share";
  import { smallLabelClass } from "../ui/styles";
  import Button from "./Button.svelte";
  import CheckboxField from "./CheckboxField.svelte";
  import InlineFeedback from "./InlineFeedback.svelte";

  type Props = {
    redirectUri: string;
    remember: boolean;
    busy: boolean;
    ownerAvailable: boolean;
    initialClientId?: string;
    onrememberchange: (value: boolean) => void;
    onconnect: (clientId: string) => void;
    onowneraccess: () => void;
  };

  let {
    redirectUri,
    remember,
    busy,
    ownerAvailable,
    initialClientId = "",
    onrememberchange,
    onconnect,
    onowneraccess,
  }: Props = $props();

  let clientId = $state("");
  let inputError = $state("");
  let copyStatus = $state("");

  $effect.pre(() => {
    clientId = initialClientId;
  });

  async function copyRedirectUri() {
    try {
      await copyText(redirectUri);
      copyStatus = CONTENT.connection.copied;
      window.setTimeout(() => (copyStatus = ""), 2_000);
    } catch {
      copyStatus = CONTENT.connection.copyFailed;
    }
  }

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const normalized = normalizeSpotifyClientId(clientId);
    if (!isValidSpotifyClientId(normalized)) {
      inputError = CONTENT.connection.invalidClientId;
      return;
    }
    inputError = "";
    onconnect(normalized);
  }
</script>

<p class={`${smallLabelClass} mb-2 mt-0`}>
  {CONTENT.connection.ownSectionLabel}
</p>
<h2 class="mb-2.5 mt-0 text-xl font-bold">
  {CONTENT.connection.ownTitle}
</h2>
<p class="mb-5 mt-0 leading-relaxed text-muted">
  {CONTENT.connection.ownDescription}
</p>

<ol class="m-0 grid list-none gap-4 p-0">
  <li class="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
    <span
      class="grid size-7 place-items-center rounded-full bg-highlight/15 text-xs font-black text-highlight"
    >
      1
    </span>
    <div>
      <strong class="block text-sm">
        {CONTENT.connection.createTitle}
      </strong>
      <p class="mb-2 mt-1 text-sm leading-relaxed text-muted">
        {CONTENT.connection.createDescription}
      </p>
      <div class="flex flex-wrap gap-2">
        <Button
          href={CONTENT.connection.createAppUrl}
          external
          size="compact"
        >
          {CONTENT.connection.createApp}
        </Button>
        <Button
          href={CONTENT.connection.openDashboardUrl}
          external
          variant="ghost"
          size="compact"
        >
          {CONTENT.connection.openDashboard}
        </Button>
      </div>
    </div>
  </li>

  <li class="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
    <span
      class="grid size-7 place-items-center rounded-full bg-highlight/15 text-xs font-black text-highlight"
    >
      2
    </span>
    <div class="min-w-0">
      <strong class="block text-sm">
        {CONTENT.connection.redirectTitle}
      </strong>
      <p class="mb-2 mt-1 text-sm leading-relaxed text-muted">
        {CONTENT.connection.redirectDescription}
      </p>
      <div class="flex items-stretch gap-2">
        <code
          class="min-w-0 flex-1 break-all rounded-control border border-line bg-main/40 px-3 py-2 font-mono text-xs leading-relaxed text-foreground"
        >
          {redirectUri || CONTENT.connection.redirectUnavailable}
        </code>
        <Button
          variant="secondary"
          size="compact"
          disabled={!redirectUri}
          onclick={copyRedirectUri}
        >
          {CONTENT.connection.copy}
        </Button>
      </div>
      <InlineFeedback
        kind={copyStatus === CONTENT.connection.copyFailed
          ? "error"
          : "success"}
        message={copyStatus}
        class="mt-1 min-h-4 text-xs"
      />
    </div>
  </li>

  <li class="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
    <span
      class="grid size-7 place-items-center rounded-full bg-highlight/15 text-xs font-black text-highlight"
    >
      3
    </span>
    <div>
      <strong class="block text-sm">
        {CONTENT.connection.clientIdTitle}
      </strong>
      <p class="mb-2 mt-1 text-sm leading-relaxed text-muted">
        {CONTENT.connection.clientIdDescription}
      </p>
    </div>
  </li>
</ol>

<form onsubmit={handleSubmit} novalidate class="mt-4">
  <label
    for="spotify-client-id"
    class="mb-1.5 block text-sm font-bold"
  >
    {CONTENT.connection.clientIdLabel}
  </label>
  <input
    id="spotify-client-id"
    bind:value={clientId}
    oninput={() => (inputError = "")}
    autocomplete="off"
    spellcheck="false"
    placeholder={CONTENT.connection.clientIdPlaceholder}
    aria-invalid={Boolean(inputError)}
    aria-describedby={inputError ? "spotify-client-id-error" : undefined}
    class="min-h-11 w-full rounded-control border border-line bg-main/40 px-3 font-mono text-sm text-foreground outline-none placeholder:text-muted/75 focus:border-highlight"
  />
  {#if inputError}
    <p
      id="spotify-client-id-error"
      class="mb-0 mt-1.5 text-sm text-danger"
    >
      {inputError}
    </p>
  {/if}

  <CheckboxField
    checked={remember}
    onchange={onrememberchange}
    class="mt-3"
  >
    {CONTENT.connection.remember}
  </CheckboxField>

  <Button
    type="submit"
    variant="primary"
    block
    loading={busy}
    loadingLabel={CONTENT.connection.connecting}
    class="mt-4"
  >
    {busy ? CONTENT.connection.connecting : CONTENT.connection.connect}
  </Button>
</form>

<p class="mb-0 mt-3 text-xs leading-relaxed text-muted">
  {CONTENT.connection.clientIdPrivacy}
</p>

{#if ownerAvailable}
  <div class="mt-4 border-t border-line pt-4">
    <Button
      variant="ghost"
      block
      disabled={busy}
      onclick={onowneraccess}
    >
      {CONTENT.connection.ownerAccess}
    </Button>
    <p class="mb-0 mt-1 text-center text-xs text-muted">
      {CONTENT.connection.ownerDescription}
    </p>
  </div>
{/if}
