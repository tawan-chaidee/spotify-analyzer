import type { StatCard, StatMetric } from "../models/dashboard";
import { CONTENT } from "../services/content";
import { Card } from "./card";

const STAT_LABELS: Record<StatMetric, string> = {
  rankedTracks: CONTENT.stats.rankedTracks,
  uniqueArtists: CONTENT.stats.uniqueArtists,
  uniqueAlbums: CONTENT.stats.uniqueAlbums,
  averageDuration: CONTENT.stats.averageDuration,
};

export function StatsGrid({ stats }: { stats: StatCard[] }) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.metric} className="p-3.5">
          <strong className="mb-1 block text-2xl tracking-[-0.04em]">
            {stat.value}
          </strong>
          <span className="text-xs text-muted">
            {STAT_LABELS[stat.metric]}
          </span>
        </Card>
      ))}
    </div>
  );
}
