import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";

/**
 * Surface — the elevated card / panel primitive. Replaces the old habit of
 * sprinkling `rounded border border-… bg-muted p-3` everywhere. Three tones:
 *
 *   - default: clean white card, subtle border (used everywhere by default).
 *   - quiet: no border, sits flush against the page background — used for
 *     the secondary content rail (recent activity, etc).
 *   - inset: subtle gray inset for code-like / preview content.
 */
export type SurfaceTone = "default" | "quiet" | "inset";
export type SurfacePadding = "none" | "sm" | "md" | "lg";

const TONE: Record<SurfaceTone, string> = {
  default: "bg-(--color-surface) border border-(--color-border) shadow-sm",
  quiet: "bg-transparent",
  inset: "bg-(--color-surface-2) border border-(--color-border)",
};

const PAD: Record<SurfacePadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  tone?: SurfaceTone;
  padding?: SurfacePadding;
  children?: ReactNode;
}

export function Surface({ tone = "default", padding = "md", className, ...rest }: SurfaceProps) {
  return <div className={cn("rounded-lg", TONE[tone], PAD[padding], className)} {...rest} />;
}

/** Header convenience for surfaces that have a title row. */
export function SurfaceHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-(--color-fg-strong)">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-xs text-(--color-muted-fg)">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
