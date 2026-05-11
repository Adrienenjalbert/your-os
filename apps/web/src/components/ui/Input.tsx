import { cn } from "@/lib/cn";
import { forwardRef } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

/**
 * Form-control primitives. Visual is a single calm token — neutral surface
 * background, subtle border, accent ring on focus. Sized at 36px (md) to
 * match Button md height for a consistent grid.
 */

const FIELD_BASE =
  "block w-full rounded-md border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-fg) placeholder:text-(--color-faint-fg) shadow-sm transition focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent-soft) disabled:cursor-not-allowed disabled:opacity-60";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={cn(FIELD_BASE, "h-9", className)} {...rest} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          FIELD_BASE,
          "h-9 pr-8 appearance-none bg-no-repeat bg-[right_0.5rem_center]",
          className,
        )}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%23667085' stroke-width='1.5'><path d='M6 8l4 4 4-4'/></svg>\")",
        }}
        {...rest}
      >
        {children}
      </select>
    );
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, rows, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows ?? 4}
      className={cn(FIELD_BASE, "py-2 leading-relaxed", className)}
      {...rest}
    />
  );
});
