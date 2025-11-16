/**
 * Normalize scope to array format
 *
 * @param scope - Single scope or array of scopes
 * @returns Array of scopes
 *
 * @internal
 */
export function normalizeScopeToArray(scope: string | ReadonlyArray<string>): Array<string> {
  if (typeof scope === "string") {
    return [scope];
  }
  return Array.from(scope);
}
