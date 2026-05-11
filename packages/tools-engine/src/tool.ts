export interface ToolInput {
  key: string;
  label: string;
  type: "number" | "text" | "select" | "boolean";
  options?: readonly string[];
  defaultValue?: string | number | boolean;
  /** Min for `number` inputs. */
  min?: number;
  /** Max for `number` inputs. */
  max?: number;
}

export interface ToolOutput<TResult> {
  key: string;
  label: string;
  /** Pure formula. Synchronous so server + client behave identically. */
  formula: (values: Record<string, unknown>) => TResult;
}

export interface ToolDefinition<TResult> {
  slug: string;
  name: string;
  description: string;
  inputs: readonly ToolInput[];
  outputs: readonly ToolOutput<TResult>[];
}

export type Tool<TResult = unknown> = ToolDefinition<TResult>;

export interface RunToolInput {
  toolDefinition: ToolDefinition<unknown>;
  values: Record<string, unknown>;
}

export function defineTool<TResult>(def: ToolDefinition<TResult>): ToolDefinition<TResult> {
  return def;
}

/**
 * Validates input values against the tool's input contract, then runs every
 * output formula. Returns a record keyed by output.key.
 */
export function runTool({ toolDefinition, values }: RunToolInput): Record<string, unknown> {
  const validated: Record<string, unknown> = {};
  for (const input of toolDefinition.inputs) {
    const raw = values[input.key] ?? input.defaultValue;
    const checked = validateInput(input, raw);
    validated[input.key] = checked;
  }
  const out: Record<string, unknown> = {};
  for (const o of toolDefinition.outputs) {
    out[o.key] = o.formula(validated);
  }
  return out;
}

function validateInput(input: ToolInput, raw: unknown): unknown {
  switch (input.type) {
    case "number": {
      const n = typeof raw === "number" ? raw : Number(raw);
      if (!Number.isFinite(n)) throw new Error(`tool input "${input.key}" must be a finite number`);
      if (input.min !== undefined && n < input.min) {
        throw new Error(`tool input "${input.key}" must be ≥ ${input.min}`);
      }
      if (input.max !== undefined && n > input.max) {
        throw new Error(`tool input "${input.key}" must be ≤ ${input.max}`);
      }
      return n;
    }
    case "text":
      return raw === undefined ? "" : String(raw);
    case "boolean":
      return Boolean(raw);
    case "select":
      if (input.options && !input.options.includes(String(raw))) {
        throw new Error(`tool input "${input.key}" must be one of ${input.options.join(", ")}`);
      }
      return String(raw);
    default:
      throw new Error(`unknown tool input type: ${input.type as string}`);
  }
}
