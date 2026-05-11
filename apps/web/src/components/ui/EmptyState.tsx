import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

/**
 * EmptyState — used whenever a list, surface, or panel has nothing to show.
 * Restrained, never decorative; one line of guidance + an optional CTA.
 */
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-(--color-border) bg-(--color-surface) px-6 py-10 text-center",
        className,
      )}
    >
      <p className="text-sm font-medium text-(--color-fg-strong)">{title}</p>
      {description ? (
        <p className="max-w-sm text-xs text-(--color-muted-fg)">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
