import type { FormEvent } from "react";
import type { SelectedSpotifyApp } from "../models/auth";
import { CONTENT } from "../services/content";
import { Button } from "./button";
import { Card } from "./card";
import { ClientIdSetup } from "./client-id-setup";

interface ConnectionCardProps {
  selectedApp: SelectedSpotifyApp | null;
  ownerAvailable: boolean;
  initialClientId?: string;
  remember: boolean;
  redirectUri: string;
  message: string;
  isError: boolean;
  busy: boolean;
  onRememberChange: (value: boolean) => void;
  onConnect: () => void;
  onClientIdSubmit: (clientId: string) => void;
  onOwnerAccess: () => void;
  onChangeApp: () => void;
}

export function ConnectionCard({
  selectedApp,
  ownerAvailable,
  initialClientId,
  remember,
  redirectUri,
  message,
  isError,
  busy,
  onRememberChange,
  onConnect,
  onClientIdSubmit,
  onOwnerAccess,
  onChangeApp,
}: ConnectionCardProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onConnect();
  }

  return (
    <Card className="bg-gradient-to-br from-white/[.06] to-white/[.02] p-6 shadow-2xl shadow-black/30">
      {selectedApp ? (
        <>
          <p className="mb-2 mt-0 text-xs font-extrabold uppercase tracking-[0.12em] text-highlight">
            {selectedApp.source === "owner"
              ? CONTENT.connection.ownerAppLabel
              : CONTENT.connection.ownAppLabel}
          </p>
          <h2 className="mb-2.5 mt-0 text-xl font-bold">
            {CONTENT.connection.readyTitle}
          </h2>
          <p className="mb-3 mt-0 leading-relaxed text-muted">
            {CONTENT.connection.readyDescription}
          </p>
          <p className="mb-4 mt-0 font-mono text-xs text-muted">
            {CONTENT.connection.clientIdEnding} ····
            {selectedApp.clientId.slice(-4)}
          </p>

          <form onSubmit={handleSubmit}>
            <label className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) =>
                  onRememberChange(event.target.checked)
                }
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

          <div className="mt-4 break-words rounded-lg bg-main/30 px-3 py-2.5 font-mono text-xs leading-relaxed text-muted">
            {CONTENT.connection.redirectLabel}:{" "}
            {redirectUri || CONTENT.connection.redirectUnavailable}
          </div>

          <Button
            variant="ghost"
            className="mt-3 w-full"
            disabled={busy}
            onClick={onChangeApp}
          >
            {CONTENT.connection.changeApp}
          </Button>
        </>
      ) : (
        <ClientIdSetup
          redirectUri={redirectUri}
          remember={remember}
          busy={busy}
          ownerAvailable={ownerAvailable}
          initialClientId={initialClientId}
          onRememberChange={onRememberChange}
          onConnect={onClientIdSubmit}
          onOwnerAccess={onOwnerAccess}
        />
      )}

      <p
        aria-live="polite"
        className={`mt-4 min-h-5 leading-relaxed ${
          isError ? "text-danger" : "text-muted"
        }`}
      >
        {message}
      </p>
    </Card>
  );
}
