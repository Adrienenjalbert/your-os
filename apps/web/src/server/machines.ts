import "server-only";
import { OnboardingMachine } from "@your-os/configurator";
import { getResearchProvider } from "./provider-factory";

/**
 * In-memory store of OnboardingMachine instances, keyed by machineId.
 *
 * v1.1 design partner test runs in single-process Vercel preview deploys —
 * one machine per browser session, one process per deploy slot. We do NOT
 * persist to disk in v1.1 (the design-partner test fits in a 90-min slot
 * and the scaffold step is the commit gate). Persistence lands in v1.2.
 *
 * The map is lazy: a machine is created on first read, so a fresh browser
 * session always gets a fresh state machine without any registration step.
 */
// Pin the map onto globalThis so server components and route handlers share
// it even if Next.js (App Router) evaluates this module twice in different
// bundle graphs. Without this, the page-render bundle and the route-handler
// bundle each get their own Map and the OnboardingMachine state appears to
// reset every navigation.
const GLOBAL_KEY = Symbol.for("your-os.web.machines");
type GlobalScope = typeof globalThis & { [GLOBAL_KEY]?: Map<string, OnboardingMachine> };
const scope = globalThis as GlobalScope;
if (!scope[GLOBAL_KEY]) {
  scope[GLOBAL_KEY] = new Map<string, OnboardingMachine>();
}
const machines: Map<string, OnboardingMachine> = scope[GLOBAL_KEY];

export function getMachine(machineId: string): OnboardingMachine {
  let machine = machines.get(machineId);
  if (!machine) {
    machine = new OnboardingMachine({ provider: getResearchProvider() });
    machines.set(machineId, machine);
  }
  return machine;
}

export function resetMachine(machineId: string): void {
  machines.delete(machineId);
}

/** Test-only helper. */
export function listMachines(): string[] {
  return [...machines.keys()];
}

/**
 * Default machine id used by the single-tenant design-partner test slot.
 * Request handlers accept an explicit `machineId` to support future
 * multi-tenant use, but the UI defaults to this constant.
 */
export const DEFAULT_MACHINE_ID = "default";
