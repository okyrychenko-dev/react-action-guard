import { type MockInstance, vi } from "vitest";
import type { Blocker, Location } from "react-router-dom";

const mockLocation: Location = {
  pathname: "/test",
  search: "",
  hash: "",
  state: null,
  key: "default",
  unstable_mask: undefined,
};

/**
 * Creates a properly typed Blocker mock for tests
 */
export function createBlockerMock(state: "blocked" | "unblocked" | "proceeding"): Blocker {
  if (state === "unblocked") {
    return {
      state: "unblocked",
      proceed: undefined,
      reset: undefined,
      location: undefined,
    };
  }

  if (state === "blocked") {
    return {
      state: "blocked",
      proceed: vi.fn(),
      reset: vi.fn(),
      location: mockLocation,
    };
  }

  // proceeding state
  return {
    state: "proceeding",
    proceed: undefined,
    reset: undefined,
    location: mockLocation,
  };
}

/**
 * Helper to safely access mock calls
 */
export function getMockCall<TArgs extends Array<unknown>>(
  mock: MockInstance<(...args: TArgs) => unknown>,
  index: number
): TArgs | undefined {
  const calls = mock.mock.calls;
  return calls[index];
}

/**
 * Type guard for a no-argument blocker function
 */
export function isNoArgBlocker(fn: unknown): fn is () => boolean {
  return typeof fn === "function" && fn.length === 0;
}
