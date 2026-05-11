export type TemplateContext = Readonly<Record<string, string | number | undefined>>;

/**
 * Tiny mustache-flavored renderer with explicit error on missing keys.
 *
 *   renderTemplate("Find {role} jobs in {city}", { role: "server", city: "NYC" })
 *
 * No HTML escaping (we don't render to HTML directly here — pages do).
 */
export function renderTemplate(template: string, context: TemplateContext): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    if (!(key in context)) {
      throw new Error(`renderTemplate: missing key "${key}" in context`);
    }
    const value = context[key];
    return value === undefined ? "" : String(value);
  });
}
