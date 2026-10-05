import type { BlockingAction } from "@okyrychenko-dev/react-action-guard";
import type { EnterpriseScope } from "../../scopes";

export type AuditScopeFilter = EnterpriseScope | "all";
export type AuditActionFilter = BlockingAction | "all";

export interface AuditFilters {
  action: AuditActionFilter;
  scope: AuditScopeFilter;
}
