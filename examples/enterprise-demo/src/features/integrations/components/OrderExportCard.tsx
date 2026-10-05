import { Button, Card, Chip, Spinner } from "@heroui/react";
import { SectionTitle } from "@shared/components";
import { useOrderExportMutation } from "../hooks";
import { formatTime } from "../integrations.utils";
import type { ReactElement } from "react";
import type { ChipColor } from "../integrations.types";

export function OrderExportCard(): ReactElement {
  const mutation = useOrderExportMutation();

  let chipColor: ChipColor = "success";
  let chipLabel = "Ready";

  if (mutation.isPending) {
    chipColor = "warning";
    chipLabel = "Exporting";
  }

  let lastRunDisplay = "Never";

  if (mutation.data) {
    lastRunDisplay = formatTime(mutation.data.exportedAt);
  }

  const handleExport = (): void => {
    mutation.mutate();
  };

  return (
    <Card aria-label="Order export">
      <Card.Header className="flex items-center justify-between gap-4">
        <SectionTitle eyebrow="ERP" title="Order Export" variant="card" />
        <Chip color={chipColor} variant="soft" size="sm">
          {chipLabel}
        </Chip>
      </Card.Header>
      <Card.Content className="flex flex-col gap-3">
        <p className="m-0 text-slate-500 text-[13px]">
          Exports completed orders to the ERP system. Blocks the checkout scope for the duration of
          the transfer.
        </p>
        {mutation.isPending && (
          <div className="flex items-center gap-2">
            <Spinner size="sm" color="accent" />
            <span className="text-teal-700 text-[13px] font-medium">Export in progress…</span>
          </div>
        )}
        {mutation.isSuccess && (
          <p className="m-0 text-teal-700 text-[13px] font-medium">
            Export completed for {mutation.data.exportedCount} orders.
          </p>
        )}
      </Card.Content>
      <Card.Footer className="flex items-center justify-between gap-3">
        <span className="text-slate-400 text-xs">Last export: {lastRunDisplay}</span>
        <Button
          variant="secondary"
          size="sm"
          onPress={handleExport}
          isDisabled={mutation.isPending}
          aria-label="Export to ERP"
        >
          Export to ERP
        </Button>
      </Card.Footer>
    </Card>
  );
}
