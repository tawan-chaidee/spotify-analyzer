import { forwardRef } from "react";
import type { DashboardMode } from "../models/app";
import { CONTENT } from "../services/content";

interface DashboardHeaderProps {
  mode: DashboardMode;
}

export const DashboardHeader = forwardRef<
  HTMLHeadingElement,
  DashboardHeaderProps
>(function DashboardHeader({ mode }, ref) {
  const shared = mode === "shared";

  return (
    <div className="mb-6">
      <p className="mb-3.5 mt-0 text-xs font-extrabold uppercase tracking-[0.13em] text-highlight">
        {shared
          ? CONTENT.dashboard.sharedEyebrow
          : CONTENT.dashboard.ownerEyebrow}
      </p>
      <h1
        ref={ref}
        tabIndex={-1}
        className="m-0 text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-[-0.075em] focus:outline-none"
      >
        {shared
          ? CONTENT.dashboard.sharedTitle
          : CONTENT.dashboard.ownerTitle}
      </h1>
      <p className="mb-0 mt-3 text-muted">
        {shared
          ? CONTENT.dashboard.sharedNote
          : CONTENT.dashboard.ownerNote}
      </p>
    </div>
  );
});
