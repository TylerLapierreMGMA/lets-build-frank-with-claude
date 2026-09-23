import { useEffect, useState } from "react";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import Box from "@cloudscape-design/components/box";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import { getStatus } from "../api/mcpClient";

type Connection = { state: "loading" } | { state: "connected" } | { state: "error"; message: string };

interface Status {
  summary: string;
  version: string;
  uptimeSeconds: number;
  greeting: string;
}

export default function Overview() {
  const [connection, setConnection] = useState<Connection>({ state: "loading" });
  const [status, setStatus] = useState<Status | undefined>();

  useEffect(() => {
    let cancelled = false;

    getStatus()
      .then((result) => {
        if (cancelled) return;
        if (result.isError) {
          setConnection({ state: "error", message: "Frank reported an error calling get_status." });
          return;
        }
        setStatus(result.structuredContent as unknown as Status);
        setConnection({ state: "connected" });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setConnection({
          state: "error",
          message: error instanceof Error ? error.message : "Could not reach Frank.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ContentLayout header={<Header variant="h1">Overview</Header>}>
      <Container header={<Header variant="h2">Connection</Header>}>
        {connection.state === "loading" && <StatusIndicator type="loading">Connecting to Frank</StatusIndicator>}
        {connection.state === "connected" && <StatusIndicator type="success">Connected</StatusIndicator>}
        {connection.state === "error" && <StatusIndicator type="error">{connection.message}</StatusIndicator>}
      </Container>

      {status && (
        <Container header={<Header variant="h2">Status</Header>}>
          <ColumnLayout columns={3} variant="text-grid">
            <div>
              <Box variant="awsui-key-label">Summary</Box>
              <div>{status.summary}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Version</Box>
              <div>{status.version}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Uptime</Box>
              <div>{status.uptimeSeconds}s</div>
            </div>
          </ColumnLayout>
        </Container>
      )}
    </ContentLayout>
  );
}
