import type { AuditEvent } from "../../audit.types";
import type { SessionSummaryMetrics } from "./SessionSummary.types";

function isPlaceOrderBlocker(blockerId: string): boolean {
  return blockerId.startsWith("place-order");
}

export function getSessionSummaryMetrics(events: ReadonlyArray<AuditEvent>): SessionSummaryMetrics {
  return {
    preventedBlockers: events.filter((event) => event.action === "add").length,
    duplicateSubmitsSuppressed: events.filter(
      (event) => event.action === "add" && isPlaceOrderBlocker(event.blockerId)
    ).length,
    timedOutBlockers: events.filter((event) => event.action === "timeout").length,
  };
}
