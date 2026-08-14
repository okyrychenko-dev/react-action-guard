import { describe, expect, it } from "vitest";
import { getBlockerAge, getSortedBlockers, isBlockerStuck } from "../ActiveBlockers.utils";
import type { StoredBlocker } from "@okyrychenko-dev/react-action-guard";

function makeBlocker(timestamp: number, priority = 0): StoredBlocker {
  return { scope: "test", reason: "Test", priority, timestamp };
}

describe("getBlockerAge", () => {
  it("should return the elapsed time since the blocker started", () => {
    expect(getBlockerAge(makeBlocker(1_000), 5_000)).toBe(4_000);
  });

  it("should clamp negative ages (clock skew) to zero", () => {
    expect(getBlockerAge(makeBlocker(5_000), 1_000)).toBe(0);
  });
});

describe("isBlockerStuck", () => {
  it("should be stuck at exactly the threshold", () => {
    expect(isBlockerStuck(makeBlocker(0), 10_000, 10_000)).toBe(true);
  });

  it("should not be stuck below the threshold", () => {
    expect(isBlockerStuck(makeBlocker(0), 9_999, 10_000)).toBe(false);
  });
});

describe("getSortedBlockers", () => {
  it("should sort by priority descending", () => {
    const map = new Map<string, StoredBlocker>([
      ["low", makeBlocker(0, 1)],
      ["high", makeBlocker(0, 10)],
    ]);

    expect(getSortedBlockers(map).map(([id]) => id)).toEqual(["high", "low"]);
  });
});
