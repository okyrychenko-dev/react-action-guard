import { Card, Chip } from "@heroui/react";
import React, { type ReactElement } from "react";
import { actionChipColor } from "./AuditEventItem.utils";
import type { AuditEvent } from "../../audit.types";

interface AuditEventItemProps {
  event: AuditEvent;
}

export function AuditEventItem(props: AuditEventItemProps): ReactElement {
  const { event } = props;

  return (
    <Card className="shrink-0">
      <Card.Content className="flex items-start gap-2.5 py-2.5">
        <Chip size="sm" color={actionChipColor(event.action)} variant="soft">
          {event.action}
        </Chip>
        <div className="flex flex-col gap-0.5 min-w-0">
          <strong className="text-[13px] text-slate-900 break-all">{event.blockerId}</strong>
          <span className="text-xs text-slate-500 truncate">
            {event.scope} · {event.reason}
          </span>
        </div>
      </Card.Content>
    </Card>
  );
}
