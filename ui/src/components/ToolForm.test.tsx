import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ToolForm, { type ToolInputSchema } from "./ToolForm";

const schema: ToolInputSchema = {
  properties: {
    name: { type: "string", description: "A name" },
    count: { type: "number", description: "A count" },
    active: { type: "boolean", description: "A flag" },
  },
  required: ["name"],
};

describe("ToolForm", () => {
  it("renders a field per schema property and submits typed values", async () => {
    const onSubmit = vi.fn();
    render(<ToolForm schema={schema} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/name \*/i), "frank");
    await userEvent.type(screen.getByLabelText(/count/i), "3");
    await userEvent.click(screen.getByLabelText(/active/i));
    await userEvent.click(screen.getByRole("button", { name: "Run" }));

    expect(onSubmit).toHaveBeenCalledWith({ name: "frank", count: 3, active: true });
  });

  it("says a tool with no parameters takes none", () => {
    render(<ToolForm schema={{}} onSubmit={vi.fn()} />);
    expect(screen.getByText(/takes no parameters/i)).toBeInTheDocument();
  });
});
