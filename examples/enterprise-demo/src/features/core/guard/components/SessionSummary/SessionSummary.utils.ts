import type { ActionRejectionCounts } from "../../../sessionEvents.types";
import type { AuditEvent } from "../../audit.types";
import type { SessionSummaryMetrics } from "./SessionSummary.types";

export function getSessionSummaryMetrics(
  events: ReadonlyArray<AuditEvent>,
  rejections: ActionRejectionCounts = { preventedActions: 0, duplicateSubmitsSuppressed: 0 },
  totalTimeouts = events.filter((event) => event.action === "timeout").length
): SessionSummaryMetrics {
  return {
    preventedBlockers: rejections.preventedActions,
    duplicateSubmitsSuppressed: rejections.duplicateSubmitsSuppressed,
    timedOutBlockers: totalTimeouts,
  };
}
