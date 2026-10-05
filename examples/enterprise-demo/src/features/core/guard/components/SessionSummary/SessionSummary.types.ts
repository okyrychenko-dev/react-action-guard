import type { ActionRejectionCounts } from "../../../sessionEvents.types";
import type { AuditEvent } from "../../audit.types";

export interface SessionSummaryProps {
  events: ReadonlyArray<AuditEvent>;
  rejections: ActionRejectionCounts;
}

export interface SessionSummaryMetrics {
  preventedBlockers: number;
  duplicateSubmitsSuppressed: number;
  timedOutBlockers: number;
}
