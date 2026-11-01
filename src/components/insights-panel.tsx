import type {
  DashboardSelection,
  InsightModel,
} from "../models/dashboard";
import { CONTENT } from "../services/content";
import { Card } from "./card";

interface InsightsPanelProps {
  insights: InsightModel;
  selection: DashboardSelection;
}

export function InsightsPanel({
  insights,
  selection,
}: InsightsPanelProps) {
  return (
    <Card className="p-5">
      <h2 className="m-0 text-lg font-bold">{CONTENT.insights.title}</h2>
      <p className="mb-4 mt-1.5 text-sm text-muted">
        {CONTENT.insights.subtitle}
      </p>

      <div>
        <InsightLine
          label={CONTENT.insights.sharedInAllRanges[selection.type]}
          value={insights.sharedItemCount}
        />
        <InsightLine
          label={CONTENT.insights.currentItems}
          value={insights.currentItemCount}
        />

        {selection.type === "tracks" ? (
          <>
            <div className="mt-4 flex justify-between gap-4 border-b border-line py-2.5 text-sm">
              <span className="text-muted">
                {CONTENT.insights.releaseYearsPrefix}{" "}
                {insights.currentItemCount}
              </span>
            </div>
            {insights.releaseYears.length ? (
              insights.releaseYears.map((item) => (
                <div
                  key={item.year}
                  className="my-2 grid grid-cols-[3rem_1fr_2rem] items-center gap-2 text-xs text-muted"
                >
                  <span>{item.year}</span>
                  <span className="h-1.5 overflow-hidden rounded-full bg-highlight/15">
                    <i
                      className="block h-full rounded-full bg-highlight"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </span>
                  <strong className="text-right">{item.count}</strong>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">
                {CONTENT.insights.noReleaseYears}
              </p>
            )}
          </>
        ) : null}
      </div>
    </Card>
  );
}

function InsightLine({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-2.5 text-sm last:border-b-0">
      <span className="text-muted">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
