export type ActionRejectionReason = "blocked" | "duplicate";

export interface ActionRejectionCounts {
  preventedActions: number;
  duplicateSubmitsSuppressed: number;
}
