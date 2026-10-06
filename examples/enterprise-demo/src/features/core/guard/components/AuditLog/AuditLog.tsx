import { EmptyState, ScrollShadow } from "@heroui/react";
import { AuditEventItem } from "./AuditEventItem";
import { exportEvents } from "./AuditLog.utils";
import { AuditLogHeader } from "./AuditLogHeader";
import type { ReactElement } from "react";
import type { AuditEvent } from "../../audit.types";

interface AuditLogProps {
  events: ReadonlyArray<AuditEvent>;
  onClear: VoidFunction;
}

export function AuditLog(props: AuditLogProps): ReactElement {
  const { events, onClear } = props;

  return (
    <>
      <AuditLogHeader
        isExportDisabled={events.length === 0}
        onExport={() => {
          exportEvents(events);
        }}
        onClear={onClear}
      />

      <ScrollShadow className="max-h-56 flex flex-col gap-2" aria-label="Audit events">
        {events.length === 0 && (
          <EmptyState className="py-3 text-slate-400 text-[13px]">
            Lifecycle events will appear here.
          </EmptyState>
        )}
        {events.map((event) => (
          <AuditEventItem key={event.id} event={event} />
        ))}
      </ScrollShadow>
    </>
  );
}
