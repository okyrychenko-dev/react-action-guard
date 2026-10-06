import type { EnterpriseScope } from "@features/core/guard/scopes";

export function formatScope(scope: EnterpriseScope): string {
  return scope.charAt(0).toUpperCase() + scope.slice(1);
}
