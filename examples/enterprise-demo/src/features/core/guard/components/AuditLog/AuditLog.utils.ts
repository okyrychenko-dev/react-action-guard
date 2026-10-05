import type { AuditEvent } from "../../audit.types";

export function exportEvents(events: ReadonlyArray<AuditEvent>): void {
  const json = JSON.stringify(events, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `guard-audit-${Date.now().toString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
