import { ConnectionCard } from "../components/connection-card";
import type { SelectedSpotifyApp } from "../models/auth";
import { CONTENT } from "../services/content";

interface ConnectionPageProps {
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

export function ConnectionPage(props: ConnectionPageProps) {
  return (
    <section className="grid min-h-[58vh] items-center gap-9 py-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,.7fr)]">
      <div>
        <p className="mb-3.5 mt-0 text-xs font-extrabold uppercase tracking-[0.13em] text-highlight">
          {CONTENT.connection.eyebrow}
        </p>
        <h1
          tabIndex={-1}
          className="m-0 max-w-3xl text-[clamp(3rem,8vw,6.8rem)] leading-[0.93] tracking-[-0.075em] focus:outline-none"
        >
          {CONTENT.connection.title}
        </h1>
        <p className="mb-6 mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          {CONTENT.connection.description}
        </p>
      </div>
      <ConnectionCard {...props} />
    </section>
  );
}
