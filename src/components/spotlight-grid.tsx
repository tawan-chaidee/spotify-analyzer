import type {
  SpotlightCard as SpotlightCardModel,
} from "../models/dashboard";
import type { TimeRange } from "../models/listening";
import { CONTENT, rangeLabel } from "../services/content";
import { safeSpotifyUrl } from "../utils/url";
import { Artwork } from "./artwork";
import { Card } from "./card";

interface SpotlightGridProps {
  cards: SpotlightCardModel[];
  range: TimeRange;
}

function SpotlightCard({
  card,
  range,
}: {
  card: SpotlightCardModel;
  range: TimeRange;
}) {
  const href = safeSpotifyUrl(card.spotifyUrl);
  const Wrapper = href ? "a" : "div";
  const kicker =
    card.kind === "track"
      ? CONTENT.ranking.trackKicker
      : CONTENT.ranking.albumKicker;

  return (
    <Card className="overflow-hidden bg-linear-to-br from-highlight/10 to-transparent transition-transform hover:-translate-y-0.5">
      <Wrapper
        {...(href
          ? {
              href,
              target: "_blank",
              rel: "noopener noreferrer",
            }
          : {})}
        className="grid min-h-35 grid-cols-[80px_minmax(0,1fr)] items-center gap-5 p-4 text-inherit no-underline sm:grid-cols-[108px_minmax(0,1fr)] sm:p-[18px]"
      >
        <Artwork
          src={card.imageUrl}
          title={card.title}
          size={108}
          className="size-20 shadow-2xl sm:size-[108px]"
        />
        <span className="min-w-0">
          <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.1em] text-highlight">
            {kicker} · {rangeLabel(range)}
          </span>
          <span className="block truncate text-xl font-black tracking-[-0.04em] sm:text-2xl">
            {card.title}
          </span>
          <span className="mt-2 block truncate text-sm text-muted">
            {card.subtitle}
          </span>
        </span>
      </Wrapper>
    </Card>
  );
}

export function SpotlightGrid({ cards, range }: SpotlightGridProps) {
  return (
    <div className="mb-4 grid gap-4 md:grid-cols-2">
      {cards.map((card, index) => (
        <SpotlightCard
          key={`${card.kind}-${index}`}
          card={card}
          range={range}
        />
      ))}
    </div>
  );
}
