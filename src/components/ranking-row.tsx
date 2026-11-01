import type {
  RankingRow as RankingRowModel,
  Trend,
} from "../models/listening";
import { CONTENT, trendCopy } from "../services/content";
import { cn } from "../utils/cn";
import { safeSpotifyUrl } from "../utils/url";
import { Artwork } from "./artwork";

function trendColorClass(direction: Trend["direction"]): string {
  switch (direction) {
    case "up":
      return "text-highlight";
    case "down":
      return "text-danger";
    case "new":
      return "text-info";
    case "stable":
      return "text-muted";
  }
}

function TrendStatus({ trend }: { trend: Trend }) {
  const text = trendCopy(trend);
  return (
    <span
      title={text.announcement}
      className={cn(
        "min-w-12 justify-self-end text-[10px] font-black uppercase tracking-wider tabular-nums sm:text-[11px]",
        trendColorClass(trend.direction),
      )}
    >
      <span aria-hidden="true">{text.label}</span>
      <span className="sr-only">{text.announcement}</span>
    </span>
  );
}

interface RankingRowProps {
  row: RankingRowModel;
  showTrend: boolean;
}

export function RankingRow({ row, showTrend }: RankingRowProps) {
  const spotifyUrl = safeSpotifyUrl(row.spotifyUrl);

  const rowClassName = cn(
    "grid min-h-14 items-center gap-2 rounded-xl p-2 text-inherit no-underline",
    "motion-safe:transition-colors hover:bg-foreground/5 active:bg-foreground/10",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight",
    "sm:gap-3",
    showTrend
      ? "grid-cols-[1.5rem_2.5rem_minmax(0,1fr)_3.25rem] sm:grid-cols-[1.75rem_3rem_minmax(0,1fr)_3.5rem]"
      : "grid-cols-[1.5rem_2.5rem_minmax(0,1fr)] sm:grid-cols-[1.75rem_3rem_minmax(0,1fr)_1.5rem]",
  );

  const body = (
    <>
      <span className="text-right text-sm text-muted tabular-nums">
        <span className="sr-only">{CONTENT.ranking.rank} </span>
        {row.rank}
      </span>
      <Artwork
        src={row.imageUrl}
        title={row.title}
        className="size-10 sm:size-12"
      />
      <span className="min-w-0">
        <span className="block truncate font-bold">{row.title}</span>
        <span className="mt-1 block truncate text-xs text-muted sm:text-[13px]">
          {row.subtitle}
        </span>
      </span>
      {showTrend && row.trend ? (
        <TrendStatus trend={row.trend} />
      ) : (
        <span aria-hidden="true" className="text-muted max-[559px]:hidden">
          ↗
        </span>
      )}
    </>
  );

  if (!spotifyUrl) {
    return (
      <li>
        <div className={rowClassName}>{body}</div>
      </li>
    );
  }

  return (
    <li>
      <a
        href={spotifyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={rowClassName}
      >
        {body}
        <span className="sr-only">{CONTENT.ranking.spotifyLink}</span>
      </a>
    </li>
  );
}
