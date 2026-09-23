import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import type { CallToolResult, Tool } from "@modelcontextprotocol/sdk/types.js";

export type { Tool, CallToolResult };

// Frank serves the console himself (ADR-006), so this is a same-origin,
// relative request — no base URL, no CORS config, no build-time env var.
function connect(): Promise<Client> {
  const client = new Client({ name: "frank-console", version: "0.1.0" });
  const transport = new StreamableHTTPClientTransport(new URL("/mcp", window.location.origin));
  return client.connect(transport).then(() => client);
}

export async function getStatus(): Promise<CallToolResult> {
  return callTool("get_status", {});
}

export async function listTools(): Promise<Tool[]> {
  const client = await connect();
  try {
    const result = await client.listTools();
    return result.tools;
  } finally {
    await client.close();
  }
}

export async function callTool(name: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const client = await connect();
  try {
    // Passing CallToolResultSchema makes the SDK validate against the
    // non-legacy shape at runtime; its declared return type stays the wider
    // (legacy-compatible) union regardless of which schema was passed, so the
    // cast reflects what the runtime validation already guarantees.
    const result = await client.callTool({ name, arguments: args }, CallToolResultSchema);
    return result as CallToolResult;
  } finally {
    await client.close();
  }
}
