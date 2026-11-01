import { useEffect, useRef } from "react";
import { DashboardHeader } from "../components/dashboard-header";
import { ExportPanel } from "../components/export-panel";
import { InsightsPanel } from "../components/insights-panel";
import { RankingControls } from "../components/ranking-controls";
import { RankingList } from "../components/ranking-list";
import { SpotlightGrid } from "../components/spotlight-grid";
import { StatsGrid } from "../components/stats-grid";
import type { DashboardModel } from "../models/dashboard";
import type {
  ListeningData,
  ListeningType,
  TimeRange,
} from "../models/listening";
import type { DashboardMode } from "../models/app";

interface DashboardPageProps {
  model: DashboardModel;
  data: ListeningData;
  mode: DashboardMode;
  busy: boolean;
  onTypeChange: (type: ListeningType) => void;
  onRangeChange: (range: TimeRange) => void;
}

export function DashboardPage({
  model,
  data,
  mode,
  busy,
  onTypeChange,
  onRangeChange,
}: DashboardPageProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [mode]);

  return (
    <section aria-busy={busy}>
      <DashboardHeader ref={headingRef} mode={mode} />
      <RankingControls
        type={model.selection.type}
        range={model.selection.range}
        onTypeChange={onTypeChange}
        onRangeChange={onRangeChange}
      />
      <SpotlightGrid
        cards={model.spotlights}
        range={model.selection.range}
      />
      <StatsGrid stats={model.stats} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,.55fr)]">
        <RankingList model={model.ranking} />
        <aside className="grid content-start gap-4">
          <InsightsPanel
            insights={model.insights}
            selection={model.selection}
          />
          <ExportPanel
            data={data}
            type={model.selection.type}
            range={model.selection.range}
            totalCount={model.exports.totalCount}
          />
        </aside>
      </div>
    </section>
  );
}
