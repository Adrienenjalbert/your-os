"use client";

import { cn } from "@/lib/cn";
import { Children, type ReactNode, cloneElement, isValidElement } from "react";

/**
 * FieldShell wraps a single form control with a label, hint, and error
 * surface in the Google-form pattern (label above, hint as small grey, error
 * as small red below). Critically the input retains its plain accessible
 * name (no nested <label>) so role-based tests stay stable.
 */
export interface FieldShellProps {
  label: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FieldShell({ label, hint, error, required, children, className }: FieldShellProps) {
  const id = useFieldId(label);
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-(--color-fg-strong)">
        {label}
        {required ? <span className="ml-0.5 text-(--color-danger)">*</span> : null}
      </label>
      <FieldChildWithId id={id}>{children}</FieldChildWithId>
      {error ? (
        <output className="text-xs text-(--color-danger)">{error}</output>
      ) : hint ? (
        <span className="text-xs text-(--color-muted-fg)">{hint}</span>
      ) : null}
    </div>
  );
}

function useFieldId(label: string): string {
  return `f-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function FieldChildWithId({ id, children }: { id: string; children: ReactNode }) {
  const child = Children.only(children);
  if (!isValidElement(child)) return <>{children}</>;
  return cloneElement(child as React.ReactElement<{ id?: string }>, { id });
}
