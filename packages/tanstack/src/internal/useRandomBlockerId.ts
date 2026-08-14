import { useId } from "react";

/**
 * Generates a random blocker ID using React's useId hook.
 * Useful when deterministic IDs are not needed (e.g., useBlockingQueries).
 *
 * @returns Stable random ID for the component instance
 */
export function useRandomBlockerId(): string {
  return useId();
}
