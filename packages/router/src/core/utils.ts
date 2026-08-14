/**
 * Resolves a condition value (boolean or function returning boolean)
 *
 * @param condition - Boolean value or function
 * @returns Resolved boolean value
 */
export function resolveCondition(condition: boolean | (() => boolean)): boolean {
  return typeof condition === "function" ? condition() : condition;
}

interface Thenable {
  then: (...args: Array<unknown>) => unknown;
}

const hasThen = (value: unknown): value is Thenable =>
  typeof value === "object" && value !== null && "then" in value;

/**
 * Checks if a value behaves like a Promise (thenable)
 */
export function isThenable<T>(value: unknown): value is PromiseLike<T> {
  if (!hasThen(value)) {
    return false;
  }
  return typeof value.then === "function";
}

export interface ConfirmResultSync {
  kind: "sync";
  confirmed: boolean;
}

export interface ConfirmResultAsync {
  kind: "async";
  promise: Promise<boolean>;
}

export type ConfirmResult = ConfirmResultSync | ConfirmResultAsync;

/**
 * Normalizes custom confirm result into sync or async branch.
 */
export function resolveConfirmResult(
  message: string,
  onConfirm: ((message: string) => boolean | PromiseLike<boolean>) | undefined,
  fallbackConfirm: (message: string) => boolean
): ConfirmResult {
  if (!onConfirm) {
    return { kind: "sync", confirmed: fallbackConfirm(message) };
  }

  const result = onConfirm(message);
  if (isThenable<boolean>(result)) {
    return { kind: "async", promise: Promise.resolve(result) };
  }

  return { kind: "sync", confirmed: result };
}

/**
 * Generates a unique blocker ID based on scope and timestamp
 *
 * @param prefix - Prefix for the ID
 * @param scope - Optional scope
 * @returns Unique blocker ID
 */
export function createBlockerId(prefix: string, scope?: string | Array<string>): string {
  const scopePart = scope ? `-${Array.isArray(scope) ? scope.join("-") : scope}` : "";
  const timestamp = String(Date.now());
  return `${prefix}${scopePart}-${timestamp}`;
}

/**
 * Checks if a value is defined and not empty
 *
 * @param value - Value to check
 * @returns True if value is defined and not empty
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

/**
 * Normalizes scope to an array
 *
 * @param scope - String or array of strings
 * @returns Array of scope strings
 */
export function normalizeScope(scope: string | Array<string> | undefined): Array<string> {
  if (!scope) {
    return [];
  }
  return Array.isArray(scope) ? scope : [scope];
}
