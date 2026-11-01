import type {
  ListeningType,
  TimeRange,
} from "../models/listening";
import { CONTENT } from "../services/content";
import {
  contentTypeOptions,
  Selector,
  timeRangeOptions,
} from "./selector";

interface RankingControlsProps {
  type: ListeningType;
  range: TimeRange;
  onTypeChange: (type: ListeningType) => void;
  onRangeChange: (range: TimeRange) => void;
}

export function RankingControls({
  type,
  range,
  onTypeChange,
  onRangeChange,
}: RankingControlsProps) {
  return (
    <div className="mb-6 mt-5 flex flex-wrap gap-2.5">
      <Selector
        label={CONTENT.controls.contentLabel}
        value={type}
        options={contentTypeOptions}
        onChange={onTypeChange}
      />
      <Selector
        label={CONTENT.controls.rangeLabel}
        value={range}
        options={timeRangeOptions}
        onChange={onRangeChange}
      />
    </div>
  );
}
