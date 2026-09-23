import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";

describe("loadConfig", () => {
  it("defaults PORT to 3000 when unset", () => {
    const config = loadConfig({});
    expect(config.port).toBe(3000);
  });

  it("uses a valid PORT from the environment", () => {
    const config = loadConfig({ PORT: "8080" });
    expect(config.port).toBe(8080);
  });

  it("resolves publicDir next to dist, not hardcoded", () => {
    const config = loadConfig({});
    expect(config.publicDir.endsWith("public")).toBe(true);
  });

  it("fails fast with a plain-language message on a non-numeric PORT", () => {
    expect(() => loadConfig({ PORT: "not-a-port" })).toThrowError(/PORT must be a number/);
  });

  it("fails fast on a PORT out of range", () => {
    expect(() => loadConfig({ PORT: "70000" })).toThrowError(/PORT must be between 1 and 65535/);
  });
});
