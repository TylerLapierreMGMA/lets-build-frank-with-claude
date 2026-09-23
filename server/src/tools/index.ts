import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTool } from "./define.js";
import { getStatus } from "./get_status.js";

const tools = [getStatus];

export function registerTools(server: McpServer): void {
  for (const tool of tools) {
    registerTool(server, tool);
  }
}

// Exposed for the conventions test — it checks every registered tool's name
// against ADR-002's naming policy without needing a live server.
export const toolNames = tools.map((tool) => tool.name);
