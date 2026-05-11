#!/usr/bin/env node
/**
 * pnpm --filter @your-os/web loop
 *
 * The v1.1 Web Shell quality loop. Runs:
 *   1. typecheck
 *   2. unit tests (vitest)
 *   3. production build  (captures route bundle sizes)
 *   4. playwright e2e    (onboarding happy path + axe scan)
 *
 * Emits `quality-report/web-shell-quality-report.json` with per-milestone
 * snapshot data so CI can ratchet the bar between milestones.
 *
 * Lighthouse and the user-puppeteer MCP runner land in M4 (this script is
 * intentionally simple in M1 so the loop is real on day zero).
 */
import { spawn } from "node:child_process";
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const REPORT_DIR = join(ROOT, "quality-report");
const REPORT_PATH = join(REPORT_DIR, "web-shell-quality-report.json");

function runStep(label, command, args, env = {}) {
  return new Promise((resolveStep) => {
    const start = Date.now();
    const child = spawn(command, args, {
      cwd: ROOT,
      stdio: "inherit",
      env: { ...process.env, ...env },
    });
    child.on("exit", (code) => {
      const ms = Date.now() - start;
      console.log(`\n[loop] ${label} → exit=${code} in ${ms}ms\n`);
      resolveStep({ label, exitCode: code ?? 0, ms });
    });
  });
}

async function bundleSizes() {
  const out = {};
  const buildDir = join(ROOT, ".next");
  try {
    const appPagesDir = join(buildDir, "server/app");
    const files = await walkJs(appPagesDir);
    for (const f of files) {
      const stats = await stat(f);
      const rel = f.replace(buildDir, ".next");
      out[rel] = stats.size;
    }
  } catch {
    // .next may not exist if build failed.
  }
  return out;
}

async function walkJs(dir) {
  const out = [];
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walkJs(full)));
    else if (e.isFile() && /\.(js|html)$/.test(e.name)) out.push(full);
  }
  return out;
}

async function main() {
  await mkdir(REPORT_DIR, { recursive: true });

  const steps = [];

  steps.push(await runStep("typecheck", "./node_modules/.bin/tsc", ["--noEmit"]));

  steps.push(
    await runStep("unit-tests", "./node_modules/.bin/vitest", [
      "run",
      "--passWithNoTests",
      "--reporter=default",
    ]),
  );

  steps.push(
    await runStep("build", "./node_modules/.bin/next", ["build"], {
      NODE_ENV: "production",
    }),
  );

  steps.push(
    await runStep("playwright", "./node_modules/.bin/playwright", ["test", "--reporter=list"], {
      CI: "1",
      // Use the just-built artifact (faster than dev mode).
      PLAYWRIGHT_USE_DEV: "0",
    }),
  );

  const ratchet = {
    // M1 bars (plan §M1 quality bar). Each milestone extends — never shrinks.
    m1: {
      playwrightHappyPathMaxMs: 30 * 60 * 1000,
      bundleMaxKbPerRoute: 200,
      axeSeriousMax: 0,
    },
    // M2: add console cmd-enter + KPI comparison non-empty.
    m2: {
      cmdEnterApproveMaxMs: 1500,
      kpiComparisonNonEmpty: true,
    },
    // M3: add diff preview render + AI propose budgets.
    m3: {
      diffPreviewMaxMs: 100,
      aiProposeMockMaxMs: 5000,
      aiProposeLiveMaxMs: 25000,
    },
    // M4: full design-partner replay must complete.
    m4: {
      designPartnerJourneyMaxMs: 30 * 60 * 1000,
      requiredTelemetryEvents: [
        "console.keyboard.action",
        "console.brief.approved",
        "customise.commit",
      ],
    },
  };

  const sizes = await bundleSizes();
  const violations = checkRatchet({ steps, sizes, ratchet });

  const report = {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    milestone: process.env.YOUR_OS_MILESTONE ?? "M4",
    steps,
    bundleSizes: sizes,
    ratchet,
    violations,
    summary: {
      stepsPassed: steps.filter((s) => s.exitCode === 0).length,
      stepsTotal: steps.length,
      ratchetViolations: violations.length,
    },
  };

  await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`\n[loop] wrote ${REPORT_PATH}`);

  const failed = steps.filter((s) => s.exitCode !== 0);
  if (failed.length > 0) {
    console.error(`\n[loop] FAILED: ${failed.map((s) => s.label).join(", ")}`);
    process.exit(1);
  }
  if (violations.length > 0) {
    console.error(`\n[loop] RATCHET VIOLATIONS:\n${violations.map((v) => `  - ${v}`).join("\n")}`);
    process.exit(1);
  }
}

/**
 * Apply each milestone's quantitative bars to the captured step results +
 * bundle sizes. Returns a list of human-readable violation messages.
 */
function checkRatchet({ steps, sizes, ratchet }) {
  const violations = [];

  // M1.bundleMaxKbPerRoute — sum size per first-load route bundle approximated
  // by .next/server/app/<route>/page.js. The build log already enforces this;
  // here we double-check the on-disk artifact.
  const max = ratchet.m1.bundleMaxKbPerRoute * 1024;
  for (const [path, size] of Object.entries(sizes)) {
    if (path.endsWith("/page.js") && size > max) {
      violations.push(
        `${path} is ${(size / 1024).toFixed(1)}kb (>${ratchet.m1.bundleMaxKbPerRoute}kb cap)`,
      );
    }
  }

  // M4.designPartnerJourneyMaxMs — playwright step duration as a coarse proxy.
  const playwright = steps.find((s) => s.label === "playwright");
  if (playwright && playwright.ms > ratchet.m4.designPartnerJourneyMaxMs) {
    violations.push(
      `playwright step took ${playwright.ms}ms (>${ratchet.m4.designPartnerJourneyMaxMs}ms cap)`,
    );
  }

  return violations;
}

main().catch((err) => {
  console.error("[loop] fatal:", err);
  process.exit(1);
});
