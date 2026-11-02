import {
  useState,
  type FormEvent,
} from "react";
import { CONTENT } from "../services/content";
import {
  isValidSpotifyClientId,
  normalizeSpotifyClientId,
} from "../services/spotify-app";
import { copyText } from "../services/sharing/share";
import { Button, ButtonLink } from "./button";

interface ClientIdSetupProps {
  redirectUri: string;
  remember: boolean;
  busy: boolean;
  ownerAvailable: boolean;
  onRememberChange: (value: boolean) => void;
  onConnect: (clientId: string) => void;
  onOwnerAccess: () => void;
}

export function ClientIdSetup({
  redirectUri,
  remember,
  busy,
  ownerAvailable,
  onRememberChange,
  onConnect,
  onOwnerAccess,
}: ClientIdSetupProps) {
  const [clientId, setClientId] = useState("");
  const [inputError, setInputError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  async function copyRedirectUri() {
    try {
      await copyText(redirectUri);
      setCopyStatus(CONTENT.connection.copied);
      window.setTimeout(() => setCopyStatus(""), 2_000);
    } catch {
      setCopyStatus(CONTENT.connection.copyFailed);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const normalized = normalizeSpotifyClientId(clientId);
    if (!isValidSpotifyClientId(normalized)) {
      setInputError(CONTENT.connection.invalidClientId);
      return;
    }
    setInputError("");
    onConnect(normalized);
  }

  return (
    <>
      <p className="mb-2 mt-0 text-xs font-extrabold uppercase tracking-[0.12em] text-highlight">
        {CONTENT.connection.ownEyebrow}
      </p>
      <h2 className="mb-2.5 mt-0 text-xl font-bold">
        {CONTENT.connection.ownTitle}
      </h2>
      <p className="mb-5 mt-0 leading-relaxed text-muted">
        {CONTENT.connection.ownDescription}
      </p>

      <ol className="m-0 grid list-none gap-4 p-0">
        <li className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
          <span className="grid size-7 place-items-center rounded-full bg-highlight/15 text-xs font-black text-highlight">
            1
          </span>
          <div>
            <strong className="block text-sm">
              {CONTENT.connection.createTitle}
            </strong>
            <p className="mb-2 mt-1 text-sm leading-relaxed text-muted">
              {CONTENT.connection.createDescription}
            </p>
            <div className="flex flex-wrap gap-2">
              <ButtonLink
                href={CONTENT.connection.createAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="compact"
              >
                {CONTENT.connection.createApp}
              </ButtonLink>
              <ButtonLink
                href={CONTENT.connection.openDashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="ghost"
                size="compact"
              >
                {CONTENT.connection.openDashboard}
              </ButtonLink>
            </div>
          </div>
        </li>

        <li className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
          <span className="grid size-7 place-items-center rounded-full bg-highlight/15 text-xs font-black text-highlight">
            2
          </span>
          <div className="min-w-0">
            <strong className="block text-sm">
              {CONTENT.connection.redirectTitle}
            </strong>
            <p className="mb-2 mt-1 text-sm leading-relaxed text-muted">
              {CONTENT.connection.redirectDescription}
            </p>
            <div className="flex items-stretch gap-2">
              <code className="min-w-0 flex-1 break-all rounded-control border border-line bg-main/40 px-3 py-2 font-mono text-xs leading-relaxed text-foreground">
                {redirectUri || CONTENT.connection.redirectUnavailable}
              </code>
              <Button
                variant="secondary"
                size="compact"
                disabled={!redirectUri}
                onClick={copyRedirectUri}
              >
                {CONTENT.connection.copy}
              </Button>
            </div>
            <span
              role="status"
              className="mt-1 block min-h-4 text-xs text-highlight"
            >
              {copyStatus}
            </span>
          </div>
        </li>

        <li className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
          <span className="grid size-7 place-items-center rounded-full bg-highlight/15 text-xs font-black text-highlight">
            3
          </span>
          <div>
            <strong className="block text-sm">
              {CONTENT.connection.clientIdTitle}
            </strong>
            <p className="mb-2 mt-1 text-sm leading-relaxed text-muted">
              {CONTENT.connection.clientIdDescription}
            </p>
          </div>
        </li>
      </ol>

      <form onSubmit={handleSubmit} noValidate className="mt-4">
        <label
          htmlFor="spotify-client-id"
          className="mb-1.5 block text-sm font-bold"
        >
          {CONTENT.connection.clientIdLabel}
        </label>
        <input
          id="spotify-client-id"
          value={clientId}
          onChange={(event) => {
            setClientId(event.target.value);
            setInputError("");
          }}
          autoComplete="off"
          spellCheck={false}
          placeholder={CONTENT.connection.clientIdPlaceholder}
          aria-invalid={Boolean(inputError)}
          aria-describedby={
            inputError ? "spotify-client-id-error" : undefined
          }
          className="min-h-11 w-full rounded-control border border-line bg-main/40 px-3 font-mono text-sm text-foreground outline-none placeholder:text-muted/60 focus:border-highlight"
        />
        {inputError ? (
          <p
            id="spotify-client-id-error"
            className="mb-0 mt-1.5 text-sm text-danger"
          >
            {inputError}
          </p>
        ) : null}

        <label className="mt-3 flex items-start gap-2.5 text-sm leading-relaxed text-muted">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => onRememberChange(event.target.checked)}
            className="mt-1 accent-highlight"
          />
          <span>{CONTENT.connection.remember}</span>
        </label>

        <Button
          type="submit"
          variant="primary"
          className="mt-4 w-full"
          disabled={busy}
        >
          {busy
            ? CONTENT.connection.connecting
            : CONTENT.connection.connect}
        </Button>
      </form>

      <p className="mb-0 mt-3 text-xs leading-relaxed text-muted">
        {CONTENT.connection.clientIdPrivacy}
      </p>

      {ownerAvailable ? (
        <div className="mt-4 border-t border-line pt-4">
          <Button
            variant="ghost"
            className="w-full"
            disabled={busy}
            onClick={onOwnerAccess}
          >
            {CONTENT.connection.ownerAccess}
          </Button>
          <p className="mb-0 mt-1 text-center text-xs text-muted">
            {CONTENT.connection.ownerDescription}
          </p>
        </div>
      ) : null}
    </>
  );
}
