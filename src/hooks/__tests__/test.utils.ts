import { act } from "@testing-library/react";

/**
 * Helper to execute an async function with proper act() wrapping
 * while preserving type information.
 */
export async function actAsync<T>(fn: () => Promise<T>): Promise<T> {
  let result!: T;
  await act(async () => {
    result = await fn();
  });
  return result;
}
