import type { ActionRejectionCounts } from "../../../sessionEvents.types";
import type { AuditEvent } from "../../audit.types";

export interface SessionSummaryProps {
  events: ReadonlyArray<AuditEvent>;
  rejections: ActionRejectionCounts;
  totalTimeouts: number;
}

export interface SessionSummaryMetrics {
  preventedBlockers: number;
  duplicateSubmitsSuppressed: number;
  timedOutBlockers: number;
}
