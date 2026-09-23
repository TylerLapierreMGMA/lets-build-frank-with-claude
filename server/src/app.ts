import express, { type Express } from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "./mcpServer.js";
import type { Config } from "./config.js";

export function createApp(config: Config): Express {
  const app = express();
  app.use(express.json());

  app.get("/healthz", (_req, res) => {
    res.status(200).send("ok");
  });

  // Stateless Streamable HTTP: a fresh server + transport per request, per the
  // MCP SDK's own stateless example. Frank holds no per-connection state, so
  // there is nothing to gain from a session store.
  app.post("/mcp", async (req, res) => {
    const server = createMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      transport.close();
      server.close();
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({
          error: error instanceof Error ? error.message : "Internal error",
        });
      }
    }
  });

  const consoleAvailable = existsSync(path.join(config.publicDir, "index.html"));

  if (consoleAvailable) {
    app.use(express.static(config.publicDir));
    // SPA fallback so client-side routes (e.g. the Tools page) still resolve
    // to index.html on a direct load or refresh.
    app.get(/^(?!\/mcp|\/healthz).*/, (_req, res) => {
      res.sendFile(path.join(config.publicDir, "index.html"));
    });
  } else {
    // ADR-003's console is built later in the class — Frank must deploy and
    // serve MCP long before it exists.
    app.get("/", (_req, res) => {
      res.status(200).send("Frank is running. The console has not been built yet (ADR-003).");
    });
  }

  return app;
}
