import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

vi.mock("./api/mcpClient", () => ({
  getStatus: vi.fn().mockResolvedValue({
    isError: false,
    structuredContent: { summary: "ok", version: "0.1.0", uptimeSeconds: 1, greeting: "hi" },
  }),
  listTools: vi.fn().mockResolvedValue([]),
  callTool: vi.fn(),
}));

describe("App", () => {
  it("renders the Overview page by default", async () => {
    render(<App />);
    expect(await screen.findByRole("heading", { name: "Overview" })).toBeInTheDocument();
  });

  it("switches to the Tools page on nav click", async () => {
    render(<App />);
    await screen.findByRole("heading", { name: "Overview" });

    await userEvent.click(screen.getByRole("link", { name: "Tools" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Tools" })).toBeInTheDocument();
    });
  });
});
