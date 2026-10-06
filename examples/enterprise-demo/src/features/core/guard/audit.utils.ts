import type { MiddlewareContext } from "@okyrychenko-dev/react-action-guard";
import type { AuditEvent } from "./audit.types";

export function createAuditEvent(context: MiddlewareContext): AuditEvent {
  const scope = context.config?.scope ?? context.scope ?? "global";
  return {
    id: `${context.timestamp.toString()}-${context.action}-${context.blockerId}`,
    action: context.action,
    blockerId: context.blockerId,
    scope: Array.isArray(scope) ? scope.join(", ") : String(scope),
    reason: context.config?.reason ?? `${context.action} ${context.blockerId}`,
    timestamp: context.timestamp,
  };
}
