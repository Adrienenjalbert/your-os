import { cn } from "@/lib/cn";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * One button to rule them all. Three variants only — primary (single focal
 * action per screen), secondary (neutral), ghost (text-only). A `tone="danger"`
 * modifier lets a secondary button signal a destructive action without
 * adding a fourth variant.
 *
 * Sizes match Google Workspace density: sm = 28px, md = 36px, lg = 40px.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonTone = "neutral" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  tone?: ButtonTone;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const SIZE: Record<ButtonSize, string> = {
  sm: "h-7 px-2.5 text-xs gap-1.5",
  md: "h-9 px-3.5 text-sm gap-2",
  lg: "h-10 px-4 text-sm gap-2",
};

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-(--color-accent) text-(--color-accent-fg) shadow-sm hover:bg-(--color-accent-hover) disabled:bg-(--color-border-strong) disabled:text-(--color-muted-fg) disabled:shadow-none",
  secondary:
    "bg-(--color-surface) text-(--color-fg) border border-(--color-border) hover:bg-(--color-surface-2) disabled:text-(--color-muted-fg)",
  ghost:
    "bg-transparent text-(--color-fg) hover:bg-(--color-surface-2) disabled:text-(--color-muted-fg)",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "secondary",
    size = "md",
    tone = "neutral",
    leadingIcon,
    trailingIcon,
    className,
    children,
    type,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition select-none",
        "disabled:cursor-not-allowed",
        SIZE[size],
        VARIANT[variant],
        tone === "danger" &&
          variant === "secondary" &&
          "border-(--color-danger) text-(--color-danger) hover:bg-(--color-danger-soft)",
        tone === "danger" &&
          variant === "ghost" &&
          "text-(--color-danger) hover:bg-(--color-danger-soft)",
        className,
      )}
      {...rest}
    >
      {leadingIcon ? <span className="-ml-0.5 inline-flex items-center">{leadingIcon}</span> : null}
      <span>{children}</span>
      {trailingIcon ? (
        <span className="-mr-0.5 inline-flex items-center">{trailingIcon}</span>
      ) : null}
    </button>
  );
});
