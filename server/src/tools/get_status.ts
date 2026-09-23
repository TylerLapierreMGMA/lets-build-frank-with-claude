import { z } from "zod";
import { defineTool } from "./define.js";
import { version } from "../version.js";

const inputSchema = {};

const outputSchema = {
  summary: z.string(),
  version: z.string(),
  uptimeSeconds: z.number(),
  greeting: z.string(),
};

export const getStatus = defineTool({
  name: "get_status",
  description:
    "Returns Frank's version, how long he has been running, and a friendly " +
    "greeting. Use this to confirm Frank is reachable and to check what " +
    "version is deployed. Takes no parameters.",
  inputSchema,
  outputSchema,
  async handler() {
    const uptimeSeconds = Math.round(process.uptime());
    const greeting = "Hello, I'm Frank.";
    return {
      summary: `Frank v${version} has been up for ${uptimeSeconds}s.`,
      version,
      uptimeSeconds,
      greeting,
    };
  },
});
