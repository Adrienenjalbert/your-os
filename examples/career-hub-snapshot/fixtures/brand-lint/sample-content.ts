/**
 * Brand-lint fixture. Mirrors the shape of a real Career Hub data file,
 * deliberately containing both clean content and seeded violations so the
 * byte-equivalence test exercises every rule.
 *
 * Frozen: do not edit casually. Any change requires re-running both the
 * Career Hub baseline script AND @your-os/brand-lint and committing the new
 * expected fixture.
 */
export const FIXTURE = {
  title: "Picking up shifts as a student",
  author: "Jane Reporter",
  source: "Indeed Flex 2026",
  dateModified: "2026-04-12",
  body: [
    "Workers earn $15-$20/hr at peak times (BLS 2025).",
    "This is a revolutionary approach to flexible work.",
    "In conclusion, you should download the app.",
    "Some pay $25/hr at busy times without any source attached.",
  ].join("\n"),
};
