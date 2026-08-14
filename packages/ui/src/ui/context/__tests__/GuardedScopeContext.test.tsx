import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  GuardedScopeProvider,
  useResolvedGuardedScope,
} from "../GuardedScopeContext";
import type { ReactNode } from "react";

describe("GuardedScopeContext", () => {
  it("should let empty explicit scope inherit scope from provider", () => {
    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <GuardedScopeProvider scope="profile">{children}</GuardedScopeProvider>
    );

    const { result } = renderHook(() => useResolvedGuardedScope([]), {
      wrapper,
    });

    expect(result.current).toBe("profile");
  });
});
