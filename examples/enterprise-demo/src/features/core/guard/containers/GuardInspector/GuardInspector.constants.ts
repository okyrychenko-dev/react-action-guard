import { ENTERPRISE_SCOPES } from "../../scopes";
import type { AuditActionFilter, AuditScopeFilter } from "./GuardInspector.types";

export const AUDIT_ACTION_FILTERS: ReadonlyArray<AuditActionFilter> = [
  "all",
  "add",
  "remove",
  "timeout",
  "clear",
  "clear_scope",
];

export const AUDIT_SCOPE_FILTERS: ReadonlyArray<AuditScopeFilter> = ["all", ...ENTERPRISE_SCOPES];
