import { useResolvedStoreApi } from "@okyrychenko-dev/react-action-guard";
import { useLayoutEffect, useState } from "react";
import { subscribeToActionRejected } from "../../../sessionEvents";
import { createAuditEvent } from "../../audit.utils";
import type { ActionRejectionCounts } from "../../../sessionEvents.types";
import type { AuditEvent } from "../../audit.types";

const MAX_AUDIT_EVENTS = 12;

export interface UseAuditLogReturn {
  totalTimeouts: number;
  rejections: ActionRejectionCounts;
  events: ReadonlyArray<AuditEvent>;
  clearEvents: VoidFunction;
}

export function useAuditLog(): UseAuditLogReturn {
  const store = useResolvedStoreApi();
  const [events, setEvents] = useState<ReadonlyArray<AuditEvent>>([]);
  const [totalTimeouts, setTotalTimeouts] = useState(0);
  const [rejections, setRejections] = useState<ActionRejectionCounts>({
    preventedActions: 0,
    duplicateSubmitsSuppressed: 0,
  });

  useLayoutEffect(() => {
    return subscribeToActionRejected(store, (reason) => {
      setRejections((current) => ({
        preventedActions: current.preventedActions + 1,
        duplicateSubmitsSuppressed:
          current.duplicateSubmitsSuppressed + Number(reason === "duplicate"),
      }));
    });
  }, [store]);

  useLayoutEffect(() => {
    const { observeBlockingEvents } = store.getState();
    return observeBlockingEvents((context) => {
      const event = createAuditEvent(context);
      if (event.action === "timeout") {
        setTotalTimeouts((total) => total + 1);
      }
      setEvents((currentEvents) => [event, ...currentEvents].slice(0, MAX_AUDIT_EVENTS));
    });
  }, [store]);

  return {
    totalTimeouts,
    rejections,
    events,
    clearEvents: () => {
      setEvents([]);
    },
  };
}
