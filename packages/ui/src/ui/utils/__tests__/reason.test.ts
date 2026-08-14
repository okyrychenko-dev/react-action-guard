import { describe, expect, it } from "vitest";
import { resolveActionReason } from "../reason";
import type { UseTopBlockerReturn } from "../../types";

const blockedScope: UseTopBlockerReturn = {
  status: "blocked",
  isBlocked: true,
  blockers: [],
  topBlocker: null,
  reason: "Saving profile",
};

describe("reason utils", () => {
  it("should reject description mode without a reason id", () => {
    expect(() =>
      resolveActionReason({
        blocker: blockedScope,
        mode: "description",
      }),
    ).toThrow('reasonId is required when reasonMode is "description"');
  });
});
