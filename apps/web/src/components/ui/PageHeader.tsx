import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

/**
 * PageHeader — the consistent top-of-content header used by every internal
 * page (Console / Customise sections). Eyebrow + h1 + optional subtitle on
 * the left, optional actions on the right. Generous bottom space to give
 * the underlying content room to breathe.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3 border-b border-(--color-border) pb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-6",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-(--color-muted-fg)">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-(--color-fg-strong)">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-(--color-muted-fg)">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
