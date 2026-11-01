import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";

type CardProps = ComponentPropsWithoutRef<"div">;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-card border border-line bg-secondary/90",
        className,
      )}
    />
  );
}
