"use client";

import { cn } from "@/lib/cn";
import { type ReactNode, useId, useState } from "react";

export interface ChoiceCardGridProps<T> {
  /** Stable key per item for React + selection tracking. */
  items: T[];
  /** Pure renderer per item (caller controls visual). */
  render: (item: T, ctx: { selected: boolean }) => ReactNode;
  keyOf: (item: T) => string;
  /** Multi-select by default; set to "single" for a radio-style picker. */
  mode?: "single" | "multi";
  /** Initial selection (uncontrolled by default). */
  defaultSelected?: string[];
  selected?: string[];
  onChange?: (selectedIds: string[]) => void;
  label: string;
  /** Optional description rendered between label and cards. */
  description?: string;
  emptyMessage?: string;
}

/**
 * The single canonical "pick from cards" primitive used everywhere in the
 * shell. Implements the *typing-minimum* principle: the user picks rather
 * than types. WCAG: cards are real radio/checkbox inputs hidden behind
 * styled labels, so screen readers announce them correctly.
 */
export function ChoiceCardGrid<T>({
  items,
  render,
  keyOf,
  mode = "multi",
  defaultSelected,
  selected,
  onChange,
  label,
  description,
  emptyMessage,
}: ChoiceCardGridProps<T>) {
  const groupName = useId();
  const [internal, setInternal] = useState<string[]>(defaultSelected ?? []);
  const isControlled = selected !== undefined;
  const value = isControlled ? selected : internal;
  const valueSet = new Set(value);

  function setValue(next: string[]) {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  }

  function toggle(id: string) {
    if (mode === "single") {
      setValue([id]);
      return;
    }
    if (valueSet.has(id)) setValue(value.filter((v) => v !== id));
    else setValue([...value, id]);
  }

  return (
    <fieldset className="block">
      <legend className="text-sm font-medium text-(--color-fg-strong)">{label}</legend>
      {description ? <p className="mt-1 text-xs text-(--color-muted-fg)">{description}</p> : null}
      {items.length === 0 ? (
        <output className="mt-3 block rounded-md border border-dashed border-(--color-border) bg-(--color-surface) px-3 py-4 text-center text-sm text-(--color-muted-fg)">
          {emptyMessage ?? "No options available yet."}
        </output>
      ) : (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {items.map((item) => {
            const id = keyOf(item);
            const isSelected = valueSet.has(id);
            const inputId = `${groupName}-${id}`;
            return (
              <li key={id}>
                <label
                  htmlFor={inputId}
                  data-selected={isSelected ? "true" : "false"}
                  data-testid="choice-card"
                  className={cn(
                    "block cursor-pointer rounded-lg border p-3 shadow-sm transition",
                    isSelected
                      ? "border-(--color-accent) bg-(--color-accent-soft) ring-2 ring-(--color-accent-soft)"
                      : "border-(--color-border) bg-(--color-surface) hover:border-(--color-accent) hover:bg-(--color-surface-2)",
                  )}
                >
                  <input
                    id={inputId}
                    type={mode === "single" ? "radio" : "checkbox"}
                    name={groupName}
                    value={id}
                    checked={isSelected}
                    onChange={() => toggle(id)}
                    className="sr-only"
                  />
                  {render(item, { selected: isSelected })}
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </fieldset>
  );
}
