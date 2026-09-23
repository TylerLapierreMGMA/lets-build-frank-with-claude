import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import request from "supertest";
import { createApp } from "../src/app.js";
import type { Config } from "../src/config.js";

function config(publicDir: string): Config {
  return { port: 0, publicDir };
}

describe("createApp", () => {
  let tempDir: string | undefined;

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = undefined;
    }
  });

  it("GET /healthz returns 200", async () => {
    const app = createApp(config(path.join(tmpdir(), "frank-no-such-public-dir")));
    const res = await request(app).get("/healthz");
    expect(res.status).toBe(200);
  });

  it("GET / says the console has not been built yet when there is none", async () => {
    const app = createApp(config(path.join(tmpdir(), "frank-no-such-public-dir")));
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/console has not been built yet/i);
  });

  it("GET / serves the built console when present", async () => {
    tempDir = mkdtempSync(path.join(tmpdir(), "frank-public-"));
    writeFileSync(path.join(tempDir, "index.html"), "<html><body>Frank console</body></html>");

    const app = createApp(config(tempDir));
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Frank console");
  });
});
