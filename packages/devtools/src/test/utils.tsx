import { RenderOptions, render } from "@testing-library/react";
import { ReactElement } from "react";

/**
 * Custom render function that can be extended with providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
): ReturnType<typeof render> {
  return render(ui, { ...options });
}

/**
 * Create a mock middleware context
 */
export function createMockContext(
  overrides?: Partial<{
    action: "add" | "remove" | "update";
    blockerId: string;
    timestamp: number;
    config: {
      scope?: string | ReadonlyArray<string>;
      reason?: string;
      priority?: number;
    };
    prevState: {
      scope?: string | ReadonlyArray<string>;
      reason?: string;
      priority?: number;
    } | null;
  }>
): {
  action: "add" | "remove" | "update";
  blockerId: string;
  timestamp: number;
  config?: {
    scope?: string | ReadonlyArray<string>;
    reason?: string;
    priority?: number;
  };
  prevState: {
    scope?: string | ReadonlyArray<string>;
    reason?: string;
    priority?: number;
  } | null;
} {
  return {
    action: "add",
    blockerId: "test-blocker",
    timestamp: Date.now(),
    config: {
      scope: "global",
      reason: "Test reason",
      priority: 10,
    },
    prevState: null,
    ...overrides,
  };
}

/**
 * Wait for a specific amount of time
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
