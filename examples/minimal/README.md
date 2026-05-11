# @your-os/example-minimal

The bare-minimum **code-mode** tenant. The CI integration test for every `@your-os/*` Layer 1 package. If this example breaks, the OS is broken.

## What's in here

```
tenant.config.ts          ← validated by @your-os/tenant-config (smallest valid config)
src/
├── seo-context.ts        ← consumed by @your-os/seo helpers
├── data-source.ts        ← @your-os/content-source CodeContentSource wiring
├── content/articles/     ← seed article (single page)
└── integration.test.ts   ← exercises every Layer 1 package end-to-end
scripts/build-static.mjs  ← placeholder build that satisfies CI
```

## Run

```bash
pnpm --filter @your-os/example-minimal test
pnpm --filter @your-os/example-minimal typecheck
```

## Where it fits

- **Acts as**: the byte-equivalent canary for the core engine. A breaking change in any Layer 1 package surfaces here first.
- **Sister example**: [`examples/minimal-strapi`](../minimal-strapi/README.md) does the same for the Strapi track.
- **Stability**: this fixture is intentionally minimal — extend instead in [`examples/employer-hub`](../employer-hub/README.md).
