import type { DashboardMode } from "../models/app";
import { CONTENT } from "../services/content";
import { Button, ButtonLink } from "./button";

interface AppHeaderProps {
  mode: DashboardMode;
  status: string;
  isMock: boolean;
  onShare?: () => void;
  onDisconnect?: () => void;
  onOwnTaste?: () => void;
}

export function AppHeader({
  mode,
  status,
  isMock,
  onShare,
  onDisconnect,
  onOwnTaste,
}: AppHeaderProps) {
  return (
    <header className="mb-9 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3 font-extrabold tracking-[-0.03em]">
        <span className="grid size-9 place-items-center rounded-full bg-highlight text-xs font-black text-on-highlight">
          {CONTENT.app.logo}
        </span>
        <span>{CONTENT.app.name}</span>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <span
          role="status"
          className="min-w-0 text-xs font-semibold text-highlight"
        >
          {status || (isMock ? CONTENT.dashboard.mockBadge : "")}
        </span>

        {mode === "shared" ? (
          <ButtonLink
            href="./"
            variant="ghost"
            onClick={(event) => {
              if (!onOwnTaste) return;
              event.preventDefault();
              onOwnTaste();
            }}
          >
            {CONTENT.dashboard.ownTaste}
          </ButtonLink>
        ) : null}

        {mode !== "shared" && onShare ? (
          <Button variant="ghost" onClick={onShare}>
            {CONTENT.dashboard.share}
          </Button>
        ) : null}

        {mode === "private" && onDisconnect ? (
          <Button variant="ghost" onClick={onDisconnect}>
            {CONTENT.dashboard.disconnect}
          </Button>
        ) : null}
      </div>
    </header>
  );
}
