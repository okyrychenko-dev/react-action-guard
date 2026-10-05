import { Card, EmptyState, ScrollShadow } from "@heroui/react";
import { OperationTimelineEntry } from "./OperationTimelineEntry";
import type { ReactElement } from "react";
import type { CheckoutOperationTimelineEntry } from "../../checkout.types";

interface OperationTimelineProps {
  entries: ReadonlyArray<CheckoutOperationTimelineEntry>;
}

export function OperationTimeline(props: OperationTimelineProps): ReactElement {
  const { entries } = props;

  return (
    <Card aria-label="Operation timeline">
      <Card.Header>
        <Card.Title className="text-[15px] font-semibold">Operation timeline</Card.Title>
      </Card.Header>
      <Card.Content>
        {entries.length === 0 ? (
          <EmptyState className="py-3 text-slate-400 text-[13px]">
            No checkout operations recorded yet.
          </EmptyState>
        ) : (
          <ScrollShadow className="max-h-44 flex flex-col gap-2">
            {entries.map((entry) => (
              <OperationTimelineEntry key={entry.id} entry={entry} />
            ))}
          </ScrollShadow>
        )}
      </Card.Content>
    </Card>
  );
}
