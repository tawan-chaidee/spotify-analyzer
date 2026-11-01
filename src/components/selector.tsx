import { CONTENT } from "../services/content";
import { cn } from "../utils/cn";

interface SelectorOption<T extends string> {
  value: T;
  label: string;
}

interface SelectorProps<T extends string> {
  label: string;
  value: T;
  options: readonly SelectorOption<T>[];
  onChange: (value: T) => void;
}

export function Selector<T extends string>({
  label,
  value,
  options,
  onChange,
}: SelectorProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex rounded-pill border border-line bg-main p-1"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-11 flex-1 rounded-pill px-3 text-center text-sm font-bold transition-colors sm:px-4",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight",
              selected
                ? "bg-highlight text-on-highlight"
                : "text-muted hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export const contentTypeOptions = [
  { value: "tracks", label: CONTENT.controls.tracks },
  { value: "artists", label: CONTENT.controls.artists },
] as const;

export const timeRangeOptions = [
  { value: "short_term", label: CONTENT.range.short_term.short },
  { value: "medium_term", label: CONTENT.range.medium_term.short },
  { value: "long_term", label: CONTENT.range.long_term.short },
] as const;
