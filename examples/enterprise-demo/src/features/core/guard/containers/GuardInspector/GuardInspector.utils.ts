import type { AuditEvent } from "../../audit.types";
import type { AuditFilters } from "./GuardInspector.types";

export function auditEventMatchesScope(event: AuditEvent, scope: string): boolean {
  return event.scope
    .split(",")
    .map((value) => value.trim())
    .includes(scope);
}

export function filterAuditEvents(
  events: ReadonlyArray<AuditEvent>,
  filters: AuditFilters
): ReadonlyArray<AuditEvent> {
  return events.filter((event) => {
    const actionMatches = filters.action === "all" || event.action === filters.action;
    const scopeMatches = filters.scope === "all" || auditEventMatchesScope(event, filters.scope);

    return actionMatches && scopeMatches;
  });
}
