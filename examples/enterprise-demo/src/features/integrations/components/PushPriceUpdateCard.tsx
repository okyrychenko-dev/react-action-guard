import { Button, Card, Chip } from "@heroui/react";
import { SectionTitle } from "@shared/components";
import { usePriceUpdateMutation } from "../hooks";
import { formatTime } from "../integrations.utils";
import type { ReactElement } from "react";
import type { ChipColor } from "../integrations.types";

export function PushPriceUpdateCard(): ReactElement {
  const mutation = usePriceUpdateMutation();

  let chipColor: ChipColor = "success";
  let chipLabel = "Ready";

  if (mutation.isPending) {
    chipColor = "warning";
    chipLabel = "Pending";
  }

  let lastRunDisplay = "Never";

  if (mutation.data) {
    lastRunDisplay = formatTime(mutation.data.pushedAt);
  }

  const handlePush = (): void => {
    mutation.mutate();
  };

  return (
    <Card aria-label="Push price update">
      <Card.Header className="flex items-center justify-between gap-4">
        <SectionTitle eyebrow="Pricing" title="Push Price Update" variant="card" />
        <Chip color={chipColor} variant="soft" size="sm">
          {chipLabel}
        </Chip>
      </Card.Header>
      <Card.Content className="flex flex-col gap-3">
        <p className="m-0 text-slate-500 text-[13px]">
          Propagates the latest pricing catalog to checkout and payment scopes simultaneously.
        </p>
        {mutation.isSuccess && (
          <p className="m-0 text-teal-700 text-[13px] font-medium">
            Prices pushed successfully ({mutation.data.catalogVersion}).
          </p>
        )}
      </Card.Content>
      <Card.Footer className="flex items-center justify-between gap-3">
        <span className="text-slate-400 text-xs">Last run: {lastRunDisplay}</span>
        <Button
          variant="secondary"
          size="sm"
          onPress={handlePush}
          isDisabled={mutation.isPending}
          aria-label="Push prices"
        >
          Push prices
        </Button>
      </Card.Footer>
    </Card>
  );
}
