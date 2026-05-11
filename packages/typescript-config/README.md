# @your-os/typescript-config

Shared `tsconfig` bases for `your-os` packages, apps, and tenants.

## What ships

| File | Use for |
| --- | --- |
| `base.json` | Universal compiler options (strict mode, target, moduleResolution). Extend everywhere. |
| `library.json` | Pure TypeScript libraries (`packages/*` built with `tsup`). Adds `declaration`, `composite`-friendly defaults. |
| `nextjs.json` | Next.js apps (`apps/web`, future tenant apps). JSX, DOM lib, `noEmit`. |
| `node.json` | Node.js scripts and CLIs (`apps/control-plane`, `tooling/scripts`). |

## Usage

```jsonc
// packages/foo/tsconfig.json
{
  "extends": "@your-os/typescript-config/library.json",
  "include": ["src"]
}
```

Every config in this package is the source of truth — change a base here and every consumer picks it up on the next build.

## Stability

`stable` — SemVer-stable. Breaking changes only on majors and only with a codemod where feasible (see [`.agents/rules/040-versioning-codemods.md`](../../.agents/rules/040-versioning-codemods.md)).
