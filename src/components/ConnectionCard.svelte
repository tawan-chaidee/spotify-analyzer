<script lang="ts">
  import type { SelectedSpotifyApp } from "../models/auth";
  import { CONTENT } from "../services/content";
  import { smallLabelClass } from "../ui/styles";
  import Button from "./Button.svelte";
  import Card from "./Card.svelte";
  import CheckboxField from "./CheckboxField.svelte";
  import ClientIdSetup from "./ClientIdSetup.svelte";
  import InlineFeedback from "./InlineFeedback.svelte";

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

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    onconnect();
  }
</script>

<Card class="bg-gradient-to-br from-white/[.06] to-white/[.02] p-6 shadow-2xl shadow-black/30">
  {#if selectedApp}
    <p class={`${smallLabelClass} mb-2 mt-0`}>
      {selectedApp.source === "owner"
        ? CONTENT.connection.ownerAppLabel
        : CONTENT.connection.ownAppLabel}
    </p>
    <h2 class="mb-2.5 mt-0 text-xl font-bold">
      {CONTENT.connection.readyTitle}
    </h2>
    <p class="mb-3 mt-0 leading-relaxed text-muted">
      {CONTENT.connection.readyDescription}
    </p>
    <p class="mb-4 mt-0 font-mono text-xs text-muted">
      {CONTENT.connection.clientIdEnding} ····
      {selectedApp.clientId.slice(-4)}
    </p>

    <form onsubmit={handleSubmit}>
      <CheckboxField
        checked={remember}
        onchange={onrememberchange}
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

    <div
      class="mt-4 break-words rounded-lg bg-main/30 px-3 py-2.5 font-mono text-xs leading-relaxed text-muted"
    >
      {CONTENT.connection.redirectLabel}:
      {redirectUri || CONTENT.connection.redirectUnavailable}
    </div>

    <Button
      variant="ghost"
      block
      disabled={busy}
      class="mt-3"
      onclick={onchangeapp}
    >
      {CONTENT.connection.changeApp}
    </Button>
  {:else}
    <ClientIdSetup
      {redirectUri}
      {remember}
      {busy}
      {ownerAvailable}
      {initialClientId}
      {onrememberchange}
      onconnect={onclientidsubmit}
      {onowneraccess}
    />
  {/if}

  <InlineFeedback
    kind={isError ? "error" : "info"}
    {message}
    class="mt-4 min-h-5"
  />
</Card>
