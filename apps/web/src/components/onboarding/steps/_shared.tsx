"use client";

import { Children, type ReactNode, cloneElement, isValidElement } from "react";

/**
 * Onboarding shared form pieces. The Field wrapper keeps the input's
 * accessible name equal to `label` so role-based selectors (Playwright,
 * screen readers) land on the input directly. Inputs use the global
 * --color-* tokens for visual coherence with the customise + console panels.
 */
export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  const id = useFieldId(label);
  return (
    <div className="block">
      <label htmlFor={id} className="text-sm font-medium text-(--color-fg-strong)">
        {label}
        {hint ? (
          <span className="ml-1 text-xs font-normal text-(--color-muted-fg)">— {hint}</span>
        ) : null}
      </label>
      <FieldChildWithId id={id}>{children}</FieldChildWithId>
      {error ? <output className="mt-1 block text-xs text-(--color-danger)">{error}</output> : null}
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

const FIELD_CLS =
  "mt-1.5 block w-full rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-sm text-(--color-fg) shadow-sm transition placeholder:text-(--color-faint-fg) focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent-soft)";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${FIELD_CLS} ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${FIELD_CLS} pr-8 ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${FIELD_CLS} min-h-[5.5rem] py-2 leading-relaxed ${props.className ?? ""}`}
    />
  );
}
