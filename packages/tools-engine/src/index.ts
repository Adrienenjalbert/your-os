/**
 * @your-os/tools-engine
 *
 * Calculator / decision-tool / ROI-calculator framework. Tenants register
 * tools via `defineTool()`; the engine handles input validation, formula
 * dispatch, and provides a typed `runTool()` for both server-rendered seed
 * results and client-side interactivity.
 */
export { defineTool, runTool, type Tool, type ToolDefinition, type RunToolInput } from "./tool.js";
export {
  createToolRegistry,
  type ToolRegistry,
  type RegisteredTool,
} from "./registry.js";
