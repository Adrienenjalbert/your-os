import type { ToolDefinition } from "./tool.js";

export interface RegisteredTool {
  definition: ToolDefinition<unknown>;
  /** Optional category tag (e.g. "earnings", "tax"). Drives index pages. */
  category?: string;
  /** When true, registry index pages list this tool. */
  visible?: boolean;
  /** Soft deprecation: still accessible but flagged in admin. */
  deprecated?: boolean;
}

export interface ToolRegistry {
  register(tool: RegisteredTool): void;
  get(slug: string): RegisteredTool | undefined;
  list(opts?: { visibleOnly?: boolean; category?: string }): RegisteredTool[];
}

export function createToolRegistry(initial: readonly RegisteredTool[] = []): ToolRegistry {
  const map = new Map<string, RegisteredTool>();
  for (const t of initial) {
    map.set(t.definition.slug, t);
  }
  return {
    register(tool) {
      map.set(tool.definition.slug, tool);
    },
    get(slug) {
      return map.get(slug);
    },
    list(opts = {}) {
      let arr = [...map.values()];
      if (opts.visibleOnly) arr = arr.filter((t) => t.visible !== false);
      if (opts.category) arr = arr.filter((t) => t.category === opts.category);
      return arr;
    },
  };
}
