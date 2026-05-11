# @your-os/example-career-hub-snapshot

Byte-equivalence harness for Career Hub extractions. Stores frozen Career Hub `tenant.config.ts` plus representative content fixtures. CI runs each extracted package against this snapshot and fails on byte drift.

This is how we guarantee Career Hub launch is never destabilized by an OS change. See [`.agents/rules/020-byte-equivalence.md`](../../.agents/rules/020-byte-equivalence.md) for the binding rule.

## What's in here

```
tenant.config.ts                        ← frozen Career Hub config
fixtures/
└── brand-lint/
    ├── sample-content.ts               ← representative tenant content
    └── expected.json                   ← brand-lint output to byte-match
brand-lint.test.ts                      ← runs @your-os/brand-lint and diffs
snapshot.test.ts                        ← additional snapshot assertions
```

## Run

```bash
pnpm --filter @your-os/example-career-hub-snapshot test
# or via root:
pnpm check:byte-equivalence
```

## Where it fits

- **The only required CI status check** for PR merges (per [`README.md` Robustness contract](../../README.md#robustness-contract)).
- **Updating fixtures**: only when the Career Hub team has confirmed a deliberate change. Never to make a new `@your-os/*` build pass.
