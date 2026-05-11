import { getMachine, resetMachine } from "@/server/machines";
import { recordEvent } from "@/server/telemetry";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface BodyShape {
  op: "snapshot" | "setFields" | "advance" | "enterStep" | "recordGate" | "finalize" | "reset";
  payload?: Record<string, unknown>;
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ machineId: string }> }) {
  const { machineId } = await ctx.params;
  const body = (await req.json()) as BodyShape;

  if (body.op === "reset") {
    resetMachine(machineId);
    return NextResponse.json({ ok: true });
  }

  const machine = getMachine(machineId);

  switch (body.op) {
    case "snapshot": {
      return NextResponse.json({ snapshot: machine.snapshot(), brief: machine.getBrief() });
    }
    case "setFields": {
      const snapshot = machine.setFields(
        (body.payload ?? {}) as Parameters<typeof machine.setFields>[0],
      );
      return NextResponse.json({ snapshot, brief: machine.getBrief() });
    }
    case "enterStep": {
      const stepId = String(body.payload?.stepId ?? "identity") as Parameters<
        typeof machine.enterStep
      >[0];
      const snapshot = machine.enterStep(stepId);
      await recordEvent("configurator.step.entered", { stepId, machineId });
      return NextResponse.json({ snapshot, brief: machine.getBrief() });
    }
    case "advance": {
      const before = Date.now();
      const stepBefore = machine.snapshot().activeStepId;
      const snapshot = machine.advance();
      const blocked = snapshot.steps[stepBefore] === "blocked";
      if (blocked) {
        await recordEvent("configurator.step.blocked", {
          machineId,
          stepId: stepBefore,
          errors: snapshot.errors,
        });
      } else {
        await recordEvent("configurator.step.advanced", {
          machineId,
          stepId: stepBefore,
          durationMs: Date.now() - before,
        });
      }
      return NextResponse.json({ snapshot, brief: machine.getBrief(), blocked });
    }
    case "recordGate": {
      const decision = body.payload as unknown as Parameters<typeof machine.recordGateDecision>[0];
      machine.recordGateDecision(decision);
      await recordEvent("configurator.gate.decision", {
        machineId,
        gate: decision.gate,
        decision: decision.decision,
      });
      return NextResponse.json({ ok: true });
    }
    case "finalize": {
      const result = await machine.finalize();
      return NextResponse.json(result);
    }
    default: {
      return NextResponse.json({ error: `Unknown op: ${String(body.op)}` }, { status: 400 });
    }
  }
}
