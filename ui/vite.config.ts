import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev-only convenience: `npm run dev` here doesn't run Frank, so proxy /mcp to
// a Frank listening locally on the default PORT. The production build calls
// /mcp as a bare relative path with no base URL — Frank serves the console
// itself, same-origin, per ADR-006 (superseding ADR-003's VITE_FRANK_URL/CORS).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/mcp": "http://localhost:3000",
    },
  },
});
