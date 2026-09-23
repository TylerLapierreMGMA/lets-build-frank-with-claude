import { useEffect, useState } from "react";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Container from "@cloudscape-design/components/container";
import Table from "@cloudscape-design/components/table";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Box from "@cloudscape-design/components/box";
import ToolForm, { type ToolInputSchema } from "../components/ToolForm";
import { callTool, listTools, type CallToolResult, type Tool } from "../api/mcpClient";

export default function Tools() {
  const [tools, setTools] = useState<Tool[]>();
  const [error, setError] = useState<string>();
  const [selected, setSelected] = useState<Tool>();
  const [result, setResult] = useState<CallToolResult>();
  const [running, setRunning] = useState(false);

  useEffect(() => {
    listTools()
      .then(setTools)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not list tools."));
  }, []);

  async function runTool(values: Record<string, unknown>) {
    if (!selected) return;
    setRunning(true);
    setResult(undefined);
    try {
      setResult(await callTool(selected.name, values));
    } catch (err) {
      setResult({
        isError: true,
        content: [{ type: "text", text: err instanceof Error ? err.message : "Tool call failed." }],
      });
    } finally {
      setRunning(false);
    }
  }

  return (
    <ContentLayout header={<Header variant="h1">Tools</Header>}>
      <SpaceBetween size="l">
        {error && <StatusIndicator type="error">{error}</StatusIndicator>}

        <Table
          items={tools ?? []}
          loading={!tools && !error}
          loadingText="Loading tools from Frank"
          selectionType="single"
          selectedItems={selected ? [selected] : []}
          onSelectionChange={({ detail }) => {
            setSelected(detail.selectedItems[0]);
            setResult(undefined);
          }}
          columnDefinitions={[
            { id: "name", header: "Name", cell: (item) => item.name },
            { id: "description", header: "Description", cell: (item) => item.description },
          ]}
          empty="No tools discovered."
        />

        {selected && (
          <Container header={<Header variant="h2">{selected.name}</Header>}>
            <SpaceBetween size="m">
              <ToolForm
                schema={selected.inputSchema as ToolInputSchema}
                onSubmit={runTool}
                submitting={running}
              />
              {result && (
                <Box>
                  <pre>{JSON.stringify(result.structuredContent ?? result.content, null, 2)}</pre>
                </Box>
              )}
            </SpaceBetween>
          </Container>
        )}
      </SpaceBetween>
    </ContentLayout>
  );
}
