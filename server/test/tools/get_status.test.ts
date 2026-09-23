import { describe, expect, it } from "vitest";
import { getStatus } from "../../src/tools/get_status.js";

describe("get_status", () => {
  it("is named per ADR-002's closed verb set", () => {
    expect(getStatus.name).toBe("get_status");
  });

  it("returns a summary, version, uptime, and greeting", async () => {
    const result = await getStatus.handler({});
    expect(result.summary).toContain(result.version);
    expect(typeof result.uptimeSeconds).toBe("number");
    expect(result.greeting.length).toBeGreaterThan(0);
  });
});
