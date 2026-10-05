import { describe, expect, it } from "vitest";
import { filterAuditEvents } from "./GuardInspector.utils";
import type { AuditEvent } from "../../audit.types";

const EVENTS: ReadonlyArray<AuditEvent> = [
  {
    id: "event-1",
    action: "add",
    blockerId: "checkout-lock",
    scope: "checkout, payment",
    reason: "Checkout blocked",
    timestamp: 1,
  },
  {
    id: "event-2",
    action: "remove",
    blockerId: "admin-lock",
    scope: "admin",
    reason: "Admin released",
    timestamp: 2,
  },
];

describe("GuardInspector utils", () => {
  it("should filter audit events by scope", () => {
    expect(filterAuditEvents(EVENTS, { scope: "payment", action: "all" })).toEqual([EVENTS[0]]);
  });

  it("should filter audit events by action", () => {
    expect(filterAuditEvents(EVENTS, { scope: "all", action: "remove" })).toEqual([EVENTS[1]]);
  });
});
