import { loadConfig } from "./config.js";
import { createApp } from "./app.js";

let config;
try {
  config = loadConfig();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

const app = createApp(config);

app.listen(config.port, () => {
  console.log(`Frank is listening on port ${config.port}`);
});
