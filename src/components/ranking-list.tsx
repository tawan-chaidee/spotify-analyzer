import type { RankingListModel } from "../models/listening";
import {
  CONTENT,
  rangeLabel,
  rankingTitle,
} from "../services/content";
import { Card } from "./card";
import { RankingRow } from "./ranking-row";

export function RankingList({ model }: { model: RankingListModel }) {
  const subtitle = `${rangeLabel(model.range)} · ${CONTENT.ranking.showingPrefix} ${model.rows.length}${
    model.showTrend ? ` · ${CONTENT.ranking.movement}` : ""
  }`;

  return (
    <Card data-component="ranking-list" className="p-4 sm:p-5">
      <h2 className="m-0 text-lg font-bold sm:text-xl">
        {rankingTitle(model.type)}
      </h2>
      <p className="mb-4 mt-1.5 text-sm text-muted">{subtitle}</p>
      <ol className="m-0 grid list-none gap-2 p-0">
        {model.rows.length === 0 ? (
          <li role="status" className="px-2 py-6 text-center text-muted">
            {CONTENT.ranking.empty}
          </li>
        ) : (
          model.rows.map((row) => (
            <RankingRow
              key={`${row.rank}:${row.id}`}
              row={row}
              showTrend={model.showTrend}
            />
          ))
        )}
      </ol>
    </Card>
  );
}
