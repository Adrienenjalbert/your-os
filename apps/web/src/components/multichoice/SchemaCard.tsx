import type { SchemaSelection } from "@your-os/configurator";

/**
 * Renders one schema-type option per content-type. The Onboarding "schema"
 * gate has only one SchemaSelection per session, so we render it as a single
 * card (selection mode = "single") with each per-content-type pair as a row.
 */
export function SchemaCardContent({ selection }: { selection: SchemaSelection }) {
  return (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-base font-medium">Primary: {selection.primary}</span>
      </div>
      <p className="mt-1 text-sm text-(--color-muted-fg)">{selection.rationale}</p>
      <ul className="mt-2 grid gap-1 text-xs">
        {Object.entries(selection.perContentType).map(([type, schema]) => (
          <li key={type} className="flex items-center justify-between gap-2">
            <span className="text-(--color-muted-fg)">{type}</span>
            <span className="font-mono">{schema}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
