import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "./tools/index.js";
import { version } from "./version.js";

// A fresh server per request (see app.ts) — Frank is stateless, so there is
// no per-connection state to leak between callers.
export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "frank",
    version,
  });
  registerTools(server);
  return server;
}
