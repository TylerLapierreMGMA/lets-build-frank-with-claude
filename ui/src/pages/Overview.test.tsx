import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Overview from "./Overview";
import { getStatus } from "../api/mcpClient";

vi.mock("../api/mcpClient", () => ({
  getStatus: vi.fn(),
}));

describe("Overview", () => {
  it("shows a loading state, then the status once it resolves", async () => {
    vi.mocked(getStatus).mockResolvedValue({
      isError: false,
      content: [],
      structuredContent: {
        summary: "Frank v0.1.0 has been up for 5s.",
        version: "0.1.0",
        uptimeSeconds: 5,
        greeting: "Hello, I'm Frank.",
      },
    });

    render(<Overview />);

    expect(screen.getByText("Connecting to Frank")).toBeInTheDocument();

    expect(await screen.findByText("0.1.0")).toBeInTheDocument();
    expect(screen.getByText("Connected")).toBeInTheDocument();
  });

  it("shows an error state when Frank is unreachable", async () => {
    vi.mocked(getStatus).mockRejectedValue(new Error("network down"));

    render(<Overview />);

    expect(await screen.findByText("network down")).toBeInTheDocument();
  });
});
