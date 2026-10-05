import { useResolvedStoreApi } from "@okyrychenko-dev/react-action-guard";
import { useEffect, useState } from "react";
import { createAuditEvent } from "../../audit.utils";
import type { AuditEvent } from "../../audit.types";

const MAX_AUDIT_EVENTS = 12;

export interface UseAuditLogReturn {
  events: ReadonlyArray<AuditEvent>;
  clearEvents: VoidFunction;
}

export function useAuditLog(): UseAuditLogReturn {
  const store = useResolvedStoreApi();
  const [events, setEvents] = useState<ReadonlyArray<AuditEvent>>([]);

  useEffect(() => {
    const { observeBlockingEvents } = store.getState();
    return observeBlockingEvents((context) => {
      const event = createAuditEvent(context);
      setEvents((currentEvents) => [event, ...currentEvents].slice(0, MAX_AUDIT_EVENTS));
    });
  }, [store]);

  return {
    events,
    clearEvents: () => {
      setEvents([]);
    },
  };
}
