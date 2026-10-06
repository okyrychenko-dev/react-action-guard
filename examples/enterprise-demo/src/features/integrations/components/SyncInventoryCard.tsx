import { Button, Card, Chip } from "@heroui/react";
import { SectionTitle } from "@shared/components";
import { useInventorySync } from "../hooks";
import { formatTime } from "../integrations.utils";
import type { ReactElement } from "react";
import type { ChipColor } from "../integrations.types";

export function SyncInventoryCard(): ReactElement {
  const query = useInventorySync();

  const isBusy = query.isPending || query.isFetching;

  let chipColor: ChipColor = "default";
  let chipLabel = "Idle";

  if (isBusy) {
    chipColor = "warning";
    chipLabel = "Syncing";
  } else if (query.isSuccess) {
    chipColor = "success";
    chipLabel = "Live";
  }

  let itemsDisplay = "—";
  let reservedDisplay = "—";
  let lastSyncDisplay = "Never";

  if (query.data) {
    itemsDisplay = query.data.items.toLocaleString();
    reservedDisplay = query.data.reserved.toLocaleString();
    lastSyncDisplay = formatTime(query.data.timestamp);
  }

  const handleRefetch = (): void => {
    void query.refetch();
  };

  return (
    <Card aria-label="Sync inventory">
      <Card.Header className="flex items-center justify-between gap-4">
        <SectionTitle eyebrow="Inventory" title="Sync Inventory" variant="card" />
        <Chip color={chipColor} variant="soft" size="sm">
          {chipLabel}
        </Chip>
      </Card.Header>
      <Card.Content className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-400 text-[11px] font-bold tracking-widest uppercase">
              Total items
            </span>
            <strong className="text-slate-900 text-xl font-bold tabular-nums">
              {itemsDisplay}
            </strong>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-400 text-[11px] font-bold tracking-widest uppercase">
              Reserved
            </span>
            <strong className="text-slate-900 text-xl font-bold tabular-nums">
              {reservedDisplay}
            </strong>
          </div>
        </div>
        <p className="m-0 text-slate-500 text-[13px]">
          Auto-refreshes every 30 seconds. Blocks the inventory scope while fetching.
        </p>
      </Card.Content>
      <Card.Footer className="flex items-center justify-between gap-3">
        <span className="text-slate-400 text-xs">Last sync: {lastSyncDisplay}</span>
        <Button
          variant="secondary"
          size="sm"
          onPress={handleRefetch}
          isDisabled={isBusy}
          aria-label="Refresh inventory now"
        >
          Refresh now
        </Button>
      </Card.Footer>
    </Card>
  );
}
