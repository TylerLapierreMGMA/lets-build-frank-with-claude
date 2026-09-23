import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createApp } from "../src/app.js";
import path from "node:path";
import { tmpdir } from "node:os";

// End-to-end over the real Streamable HTTP wire — proves /mcp works with the
// SDK's own client, not just that our handler code runs.
describe("POST /mcp", () => {
  let server: Server;
  let baseUrl: URL;

  beforeAll(async () => {
    const app = createApp({
      port: 0,
      publicDir: path.join(tmpdir(), "frank-no-such-public-dir"),
    });
    server = app.listen(0);
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const { port } = server.address() as AddressInfo;
    baseUrl = new URL(`http://127.0.0.1:${port}/mcp`);
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("lists get_status and calls it", async () => {
    const client = new Client({ name: "test-client", version: "0.0.0" });
    const transport = new StreamableHTTPClientTransport(baseUrl);
    await client.connect(transport);

    const tools = await client.listTools();
    expect(tools.tools.map((t) => t.name)).toContain("get_status");

    const result = await client.callTool({ name: "get_status", arguments: {} });
    expect(result.isError).not.toBe(true);
    expect(result.structuredContent).toMatchObject({
      greeting: expect.any(String),
      version: expect.any(String),
    });

    await client.close();
  });
});
