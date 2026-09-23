import { describe, expect, it } from "vitest";
import { toolNames } from "../../src/tools/index.js";

const ALLOWED_VERBS = ["get", "list", "search", "summarize"];
const NAME_PATTERN = new RegExp(`^(${ALLOWED_VERBS.join("|")})_[a-z][a-z0-9_]*$`);

// A cheap, automated backstop for ADR-002's naming rule — independent of the
// tool-conventions review agent, and it runs on every `npm test`.
describe("tool naming conventions (ADR-002)", () => {
  it("has at least one registered tool", () => {
    expect(toolNames.length).toBeGreaterThan(0);
  });

  it.each(toolNames)("%s is verb_noun from the closed verb set", (name) => {
    expect(name).toMatch(NAME_PATTERN);
  });
});
