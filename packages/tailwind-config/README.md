# @your-os/tailwind-config

Shared Tailwind CSS v4 design tokens + preset.

## Usage in a tenant

```css
/* tenant's globals.css */
@import "@your-os/tailwind-config/tokens.css";
@import "tailwindcss";

/* Override per tenant.config.ts brand */
@theme {
  --color-brand-primary: var(--tenant-brand-primary, oklch(0.55 0.2 250));
}
```

The `@your-os/core` page shells consume `--color-brand-*` tokens, so theming a tenant is just overriding these values.
