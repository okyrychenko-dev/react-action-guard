import { Button, Card, Chip } from "@heroui/react";
import { SectionTitle } from "@shared/components";
import { usePaymentGatewayValidation } from "../hooks";
import { formatTime } from "../integrations.utils";
import type { ReactElement } from "react";
import type { ChipColor } from "../integrations.types";

export function ValidatePaymentGatewayCard(): ReactElement {
  const query = usePaymentGatewayValidation();

  const isChecking = query.isFetching;

  let chipColor: ChipColor = "default";
  let chipLabel = "Unknown";

  if (isChecking) {
    chipColor = "warning";
    chipLabel = "Checking";
  } else if (query.isError) {
    chipColor = "danger";
    chipLabel = "Failed";
  } else if (query.isSuccess) {
    switch (query.data.status) {
      case "ok":
        chipColor = "success";
        chipLabel = "Healthy";
        break;
      case "degraded":
        chipColor = "warning";
        chipLabel = "Degraded";
        break;
      case "error":
        chipColor = "danger";
        chipLabel = "Error";
        break;
    }
  }

  let lastRunDisplay = "Never";

  if (query.dataUpdatedAt > 0) {
    lastRunDisplay = formatTime(query.dataUpdatedAt);
  }

  const handleRefetch = (): void => {
    void query.refetch();
  };

  return (
    <Card aria-label="Validate payment gateway">
      <Card.Header className="flex items-center justify-between gap-4">
        <SectionTitle eyebrow="Payment" title="Validate Payment Gateway" variant="card" />
        <Chip color={chipColor} variant="soft" size="sm">
          {chipLabel}
        </Chip>
      </Card.Header>
      <Card.Content className="flex flex-col gap-3">
        <p className="m-0 text-slate-500 text-[13px]">
          On-demand health check for the payment gateway. Blocks the payment scope while running.
        </p>
        {query.isSuccess && (
          <p className="m-0 text-slate-700 text-[13px]">
            Latency: <strong className="font-semibold">{query.data.latency} ms</strong>
          </p>
        )}
      </Card.Content>
      <Card.Footer className="flex items-center justify-between gap-3">
        <span className="text-slate-400 text-xs">Last check: {lastRunDisplay}</span>
        <Button
          variant="secondary"
          size="sm"
          onPress={handleRefetch}
          isDisabled={isChecking}
          aria-label="Run health check"
        >
          Run health check
        </Button>
      </Card.Footer>
    </Card>
  );
}
