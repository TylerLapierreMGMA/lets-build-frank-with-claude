import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ZodRawShape } from "zod";

// The closed verb set from ADR-002. create_/update_/delete_/run_ are out of
// policy on purpose — see docs/adr/ADR-002-mcp-tool-conventions.md.
const ALLOWED_VERBS = ["get", "list", "search", "summarize"] as const;
const NAME_PATTERN = new RegExp(`^(${ALLOWED_VERBS.join("|")})_[a-z][a-z0-9_]*$`);

export interface ToolDefinition<
  Input extends ZodRawShape,
  Output extends ZodRawShape,
> {
  name: string;
  description: string;
  inputSchema: Input;
  outputSchema: Output;
  handler: (
    input: z.objectOutputType<Input, z.ZodTypeAny>,
  ) => Promise<z.objectOutputType<Output, z.ZodTypeAny>>;
}

// Enforces ADR-002's naming rule structurally, at registration time, instead
// of relying only on the tool-conventions review agent to catch a violation.
export function defineTool<Input extends ZodRawShape, Output extends ZodRawShape>(
  definition: ToolDefinition<Input, Output>,
): ToolDefinition<Input, Output> {
  if (!NAME_PATTERN.test(definition.name)) {
    throw new Error(
      `Tool name "${definition.name}" is out of policy (ADR-002): names must be ` +
        `verb_noun with the verb from the closed set [${ALLOWED_VERBS.join(", ")}].`,
    );
  }
  return definition;
}

export function registerTool<Input extends ZodRawShape, Output extends ZodRawShape>(
  server: McpServer,
  definition: ToolDefinition<Input, Output>,
): void {
  // ADR-002 requires unknown fields to be rejected. The SDK's own inputSchema
  // wiring (needed for JSON-schema/tool-discovery output) does not guarantee
  // `.strict()`, so re-validate strictly here before the handler ever runs.
  const strictInput = z.object(definition.inputSchema).strict();

  // The SDK's registerTool overload resolves its callback type through a
  // conditional type keyed on its own generics, which TypeScript can't verify
  // structurally against a *wrapper's* still-abstract Input/Output type
  // parameters. The cast is narrow and local; runtime safety comes from the
  // strict zod re-validation below and from get_status.test.ts / mcp.test.ts,
  // not from this call's inferred type.
  server.registerTool(
    definition.name,
    {
      description: definition.description,
      inputSchema: definition.inputSchema,
      outputSchema: definition.outputSchema,
    },
    (async (input: unknown) => {
      const parsed = strictInput.safeParse(input);
      if (!parsed.success) {
        return {
          isError: true,
          content: [
            { type: "text", text: `Invalid input: ${parsed.error.issues.map((i) => i.message).join("; ")}` },
          ],
        };
      }

      try {
        const result = await definition.handler(parsed.data as never);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          structuredContent: result,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          isError: true,
          content: [{ type: "text", text: message }],
        };
      }
    }) as never,
  );
}
