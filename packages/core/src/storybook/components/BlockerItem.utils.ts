import { isReadonlyArray } from "@okyrychenko-dev/type-utils";

export function formatScope(scope: string | ReadonlyArray<string>): string {
  return isReadonlyArray(scope) ? scope.join(", ") : scope;
}
