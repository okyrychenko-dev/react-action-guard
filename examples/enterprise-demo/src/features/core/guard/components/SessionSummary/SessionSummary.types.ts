import type { AuditEvent } from "../../audit.types";

export interface SessionSummaryProps {
  events: ReadonlyArray<AuditEvent>;
}

export interface SessionSummaryMetrics {
  preventedBlockers: number;
  duplicateSubmitsSuppressed: number;
  timedOutBlockers: number;
}
