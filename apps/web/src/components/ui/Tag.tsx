import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";

/**
 * Tag (a.k.a. chip / pill / badge). Used for status, intent, count, and
 * selectable filters. Tones map onto our state colors using soft backgrounds
 * + saturated foregrounds to stay legible on white.
 */
export type TagTone = "neutral" | "accent" | "success" | "warn" | "danger";

const TONE: Record<TagTone, string> = {
  neutral: "bg-(--color-surface-2) text-(--color-muted-fg) border-(--color-border)",
  accent: "bg-(--color-accent-soft) text-(--color-accent) border-(--color-accent)/20",
  success: "bg-(--color-success-soft) text-(--color-success) border-(--color-success)/20",
  warn: "bg-(--color-warn-soft) text-(--color-warn) border-(--color-warn)/20",
  danger: "bg-(--color-danger-soft) text-(--color-danger) border-(--color-danger)/20",
};

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: TagTone;
  leading?: ReactNode;
  children: ReactNode;
}

export function Tag({ tone = "neutral", leading, children, className, ...rest }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        TONE[tone],
        className,
      )}
      {...rest}
    >
      {leading}
      {children}
    </span>
  );
}
