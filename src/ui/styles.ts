import { cn } from "../utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "default" | "compact";

export function buttonClass(options: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
}): string {
  const {
    variant = "secondary",
    size = "default",
    block = false,
    className,
  } = options;
  const variantClass =
    variant === "primary"
      ? "bg-highlight text-on-highlight hover:brightness-105"
      : variant === "ghost"
        ? "bg-transparent text-muted hover:bg-foreground/5 hover:text-foreground"
        : "border border-line bg-secondary text-foreground hover:border-highlight/60";

  return cn(
    "inline-flex min-h-11 items-center justify-center rounded-control",
    "text-sm font-extrabold transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight",
    "disabled:cursor-not-allowed disabled:opacity-50",
    block && "w-full",
    size === "compact" ? "min-w-12 px-3" : "px-4",
    variantClass,
    className,
  );
}

export type CardTone = "default" | "highlight" | "interactive";
export type CardPadding = "none" | "sm" | "md" | "lg";

const cardToneClasses: Record<CardTone, string> = {
  default: "bg-secondary/90",
  highlight: "bg-linear-to-br from-highlight/10 to-transparent",
  interactive:
    "bg-linear-to-br from-highlight/10 to-transparent transition-transform hover:-translate-y-0.5",
};

const cardPaddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-3.5",
  md: "p-4 sm:p-5",
  lg: "p-6",
};

export function cardClass(options: {
  tone?: CardTone;
  padding?: CardPadding;
  className?: string;
}): string {
  return cn(
    "rounded-card border border-line",
    cardToneClasses[options.tone ?? "default"],
    cardPaddingClasses[options.padding ?? "none"],
    options.className,
  );
}

export type FeedbackKind = "info" | "success" | "warning" | "error";

const feedbackToneClasses: Record<FeedbackKind, string> = {
  info: "border-line bg-foreground/[0.03] text-muted",
  success: "border-highlight/25 bg-highlight/[0.07] text-highlight",
  warning: "border-info/25 bg-info/[0.07] text-info",
  error: "border-danger/25 bg-danger/[0.07] text-danger",
};

export function feedbackClass(
  kind: FeedbackKind,
  className?: string,
): string {
  return cn(
    "rounded-control border px-3 py-2 text-sm leading-relaxed",
    feedbackToneClasses[kind],
    className,
  );
}

export type StatusTone = "neutral" | "success" | "danger" | "info";

const statusToneClasses: Record<StatusTone, string> = {
  neutral: "text-muted",
  success: "text-highlight",
  danger: "text-danger",
  info: "text-info",
};

const statusSoftToneClasses: Record<StatusTone, string> = {
  neutral: "border-line bg-foreground/5",
  success: "border-highlight/25 bg-highlight/10",
  danger: "border-danger/25 bg-danger/10",
  info: "border-info/25 bg-info/10",
};

export function statusBadgeClass(options: {
  tone?: StatusTone;
  soft?: boolean;
  className?: string;
}): string {
  const tone = options.tone ?? "neutral";
  return cn(
    "inline-flex items-center whitespace-nowrap font-extrabold",
    statusToneClasses[tone],
    options.soft &&
      cn(
        "rounded-pill border px-2.5 py-1 text-[10px] uppercase tracking-wider",
        statusSoftToneClasses[tone],
      ),
    options.className,
  );
}

export const smallLabelClass =
  "block text-xs font-extrabold uppercase tracking-[0.12em] text-highlight";
