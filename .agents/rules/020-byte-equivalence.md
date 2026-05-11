# Rule 020 — Byte-equivalence on extractions

Every Phase 1 + Phase 2 extraction from Career Hub must produce **byte-identical** output to the pre-extraction Career Hub helper. This is the non-negotiable gate that protects Career Hub launch.

## How to add a byte-equivalence test

1. Capture the current Career Hub output as a fixture in `examples/career-hub-snapshot/fixtures/<helper-name>/`. Commit it.
2. Write a vitest in the new package that:
   - Reads the fixture input.
   - Runs the new package's helper.
   - Asserts `expect(output).toEqual(fixture.expectedOutput)` (byte-for-byte for strings, structural for objects).
3. Add a CI job that runs all `examples/career-hub-snapshot` tests before any release.

## When byte-equivalence is impossible

If a refactor genuinely cannot be byte-equivalent (e.g. JSON-LD ordering changes), **the PR explicitly documents why** under `## Notes` and the change requires:

- An updated fixture (committed in the same PR).
- A note in the next Career Hub PR's release notes.
- Sign-off from a Career Hub team owner via `CODEOWNERS`.
