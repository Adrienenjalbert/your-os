---
name: extract-from-career-hub
description: Playbook for extracting a helper from Career Hub's nextjs-app/ into a versioned @your-os/* package, with byte-equivalence guarantee.
---

# Extract from Career Hub

## When to use

Phase 1 + Phase 2 only. Extracting an existing Career Hub helper into a versioned `@your-os/*` package while preserving byte-identical behavior.

## Steps

1. **Identify the boundary.** Read the Career Hub helper end-to-end. List its inputs, outputs, side effects, and Career Hub-specific assumptions (constants, brand strings, hardcoded slugs).
2. **Capture a fixture.** Pick 3–10 representative inputs. Run the Career Hub helper. Save inputs + outputs to `examples/career-hub-snapshot/fixtures/<helper>/`.
3. **Re-implement in the package.** New file under `packages/<name>/src/`. Replace Career Hub-specific assumptions with reads from `tenantConfig`. Keep the algorithm byte-identical.
4. **Add the byte-equivalence test.** Vitest in the new package consuming the fixture. Test name: `<helper>: byte-equivalent to Career Hub baseline`.
5. **Wire Career Hub** (separate PR in the Career Hub repo) to import from `@your-os/<name>` via npm. Keep the old helper around for one release behind a deprecation warning.
6. **Verify in Career Hub CI.** Run Career Hub's full test + smoke + SEO audit. Compare built HTML on 10 representative routes via diff.
7. **Remove the old Career Hub helper** in a follow-up PR after one green release window.

## Forbidden

- Refactoring during extraction. The extraction PR is byte-equivalent or it's not merged.
- Adding new features in the extraction PR. Features come in subsequent PRs.
- Breaking the public API of the helper. If the API needs to change, that's a separate breaking-change PR with a codemod.
