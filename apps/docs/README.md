# @your-os/docs

Public documentation site for the OS. Powered by Fumadocs (Next.js).

## Status

Scaffold present; content is filled in incrementally as packages stabilize. The canonical reference for OS contributors is the in-repo READMEs starting at [`your-os/README.md`](../../README.md) and [`AGENTS.md`](../../AGENTS.md) — this app is the public-facing surface, not the source of truth.

## Local

```bash
pnpm --filter @your-os/docs dev
```

## Where it fits

- **Layer**: app — published documentation site.
- **Not in `.changeset/` releases**: this app is a CI surface, not a published package.
