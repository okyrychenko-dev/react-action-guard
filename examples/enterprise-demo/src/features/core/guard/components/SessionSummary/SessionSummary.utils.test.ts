import { describe, expect, it } from "vitest";
import { getSessionSummaryMetrics } from "./SessionSummary.utils";
import type { AuditEvent } from "../../audit.types";

const EVENTS: ReadonlyArray<AuditEvent> = [
  {
    id: "event-1",
    action: "add",
    blockerId: "place-order-1",
    scope: "checkout, payment",
    reason: "Placing order",
    timestamp: 1,
  },
  {
    id: "event-2",
    action: "add",
    blockerId: "save-cart-1",
    scope: "checkout",
    reason: "Saving cart",
    timestamp: 2,
  },
  {
    id: "event-3",
    action: "timeout",
    blockerId: "maintenance",
    scope: "global",
    reason: "Expired",
    timestamp: 3,
  },
];

describe("SessionSummary utils", () => {
  it("should calculate session summary metrics from rejection counts and audit events", () => {
    expect(
      getSessionSummaryMetrics(EVENTS, { preventedActions: 2, duplicateSubmitsSuppressed: 1 })
    ).toEqual({
      preventedBlockers: 2,
      duplicateSubmitsSuppressed: 1,
      timedOutBlockers: 1,
    });
  });
});
