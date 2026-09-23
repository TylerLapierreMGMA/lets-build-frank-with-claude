import { fileURLToPath } from "node:url";
import path from "node:path";
import { z } from "zod";

// This module lives at dist/config.js at runtime (compiled from src/config.ts),
// one level under the package root — the same layout the Dockerfile builds:
// /app/dist (this file) and /app/public (the built console) are siblings.
const packageRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const envSchema = z.object({
  PORT: z.coerce
    .number({ invalid_type_error: "PORT must be a number" })
    .int("PORT must be a whole number")
    .min(1, "PORT must be between 1 and 65535")
    .max(65535, "PORT must be between 1 and 65535")
    .optional()
    .default(3000),
});

export interface Config {
  port: number;
  publicDir: string;
}

// Called once at boot (see index.ts). A bad container fails fast here, with a
// plain-language message, instead of at the first request.
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const messages = parsed.error.issues.map((issue) => issue.message).join("; ");
    throw new Error(`Invalid configuration: ${messages}`);
  }

  return {
    port: parsed.data.PORT,
    publicDir: path.join(packageRoot, "public"),
  };
}
