import type { BlockingAction } from "@okyrychenko-dev/react-action-guard";

export interface AuditEvent {
  id: string;
  action: BlockingAction;
  blockerId: string;
  scope: string;
  reason: string;
  timestamp: number;
}

export type AuditEventListener = (event: AuditEvent) => void;
