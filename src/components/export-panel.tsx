import type {
  ListeningData,
  ListeningType,
  TimeRange,
} from "../models/listening";
import type { ReactNode } from "react";
import { CONTENT, rangeLabel } from "../services/content";
import {
  createCompleteCsv,
  createCompleteJson,
  createCurrentCsv,
  createCurrentJson,
  downloadExport,
  type ExportFile,
} from "../services/export";
import { Button } from "./button";
import { Card } from "./card";

interface ExportPanelProps {
  data: ListeningData;
  type: ListeningType;
  range: TimeRange;
  totalCount: number;
}

export function ExportPanel({
  data,
  type,
  range,
  totalCount,
}: ExportPanelProps) {
  const currentCount = data[type][range].length;

  function run(factory: () => ExportFile) {
    downloadExport(factory());
  }

  return (
    <Card className="p-5">
      <h2 className="m-0 text-lg font-bold">{CONTENT.exports.title}</h2>
      <p className="mb-4 mt-1.5 text-sm text-muted">
        {CONTENT.exports.subtitle}
      </p>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2">
        <span />
        <span className="text-center text-[10px] font-extrabold uppercase tracking-widest text-muted">
          {CONTENT.exports.formatCsv}
        </span>
        <span className="text-center text-[10px] font-extrabold uppercase tracking-widest text-muted">
          {CONTENT.exports.formatJson}
        </span>

        <ExportRow
          title={CONTENT.exports.current}
          meta={`${type === "tracks" ? CONTENT.ranking.title.tracks : CONTENT.ranking.title.artists} · ${rangeLabel(range)} · ${currentCount} rows`}
          scope={CONTENT.exports.current}
          onCsv={() => run(() => createCurrentCsv(data, type, range))}
          onJson={() => run(() => createCurrentJson(data, type, range))}
        />

        <ExportRow
          title={CONTENT.exports.complete}
          meta={`Tracks and artists · 3 ranges · ${totalCount} rows`}
          scope={CONTENT.exports.complete}
          onCsv={() => run(() => createCompleteCsv(data))}
          onJson={() => run(() => createCompleteJson(data))}
        />
      </div>
    </Card>
  );
}

interface ExportRowProps {
  title: string;
  meta: string;
  scope: string;
  onCsv: () => void;
  onJson: () => void;
}

function ExportRow({
  title,
  meta,
  scope,
  onCsv,
  onJson,
}: ExportRowProps) {
  return (
    <div className="contents">
      <span className="min-w-0 border-t border-line py-3">
        <strong className="block text-sm">{title}</strong>
        <span className="mt-1 block truncate text-[11px] text-muted">
          {meta}
        </span>
      </span>
      <span className="border-t border-line py-3">
        <FormatButton
          label={`${CONTENT.exports.formatCsv}: ${scope}`}
          onClick={onCsv}
        >
          {CONTENT.exports.formatCsv}
        </FormatButton>
      </span>
      <span className="border-t border-line py-3">
        <FormatButton
          label={`${CONTENT.exports.formatJson}: ${scope}`}
          onClick={onJson}
        >
          {CONTENT.exports.formatJson}
        </FormatButton>
      </span>
    </div>
  );
}

function FormatButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      variant="secondary"
      size="compact"
      aria-label={label}
      onClick={onClick}
      className="w-full px-2"
    >
      {children}
    </Button>
  );
}
