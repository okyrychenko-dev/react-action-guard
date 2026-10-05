import { Chip } from "@heroui/react";
import { statusColor } from "./OperationTimelineEntry.utils";
import type { ReactElement } from "react";
import type { CheckoutOperationTimelineEntry } from "../../checkout.types";

interface OperationTimelineEntryProps {
  entry: Readonly<CheckoutOperationTimelineEntry>;
}

export function OperationTimelineEntry(props: OperationTimelineEntryProps): ReactElement {
  const { entry } = props;

  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-slate-900/8 bg-slate-50 px-3 py-2">
      <div>
        <strong className="block text-[13px] text-slate-900">{entry.label}</strong>
        <span className="block text-[12px] text-slate-500">{entry.detail}</span>
      </div>
      <Chip color={statusColor(entry.status)} variant="soft" size="sm">
        {entry.status}
      </Chip>
    </div>
  );
}
