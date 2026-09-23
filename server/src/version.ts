import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import path from "node:path";

const packageRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf-8")) as {
  version: string;
};

export const version = pkg.version;
