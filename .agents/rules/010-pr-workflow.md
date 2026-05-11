# Rule 010 — PR workflow

- Base branch: `main`. No `develop` branch.
- One feature per PR. Mixed-scope PRs get split.
- Every package change includes a `pnpm changeset` entry. CI blocks merges without one (when changing files under `packages/*`).
- PR body: `## Summary`, `## Verification` (commands run), `## Notes`.
- Default verification:
  ```
  pnpm install
  pnpm build
  pnpm typecheck
  pnpm test
  pnpm lint
  ```
- Strapi-track PRs additionally run `examples/minimal-strapi` integration tests.
- Phase 1+2 extraction PRs additionally run the byte-equivalence harness against `examples/career-hub-snapshot`.
