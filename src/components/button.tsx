import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
} from "react";
import { cn } from "../utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "default" | "compact";

interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

function buttonClassName({
  variant = "secondary",
  size = "default",
  className,
}: ButtonStyleProps & { className?: string }) {
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
    size === "compact" ? "min-w-12 px-3" : "px-4",
    variantClass,
    className,
  );
}

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonStyleProps {}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={buttonClassName({ variant, size, className })}
    />
  );
}

interface ButtonLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    ButtonStyleProps {}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <a
      {...props}
      className={buttonClassName({ variant, size, className })}
    />
  );
}
