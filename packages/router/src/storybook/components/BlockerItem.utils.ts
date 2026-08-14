export function formatScope(scope: string | ReadonlyArray<string>): string {
  return Array.isArray(scope) ? scope.join(", ") : (scope as string);
}
