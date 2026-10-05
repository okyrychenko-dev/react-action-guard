import { describe, expect, it } from "vitest";
import { resolvePriorityColor } from "./team.utils";

describe("team utils", () => {
  it("should mark high priority blockers as danger", () => {
    expect(resolvePriorityColor(85)).toBe("danger");
    expect(resolvePriorityColor(99)).toBe("danger");
  });

  it("should mark medium priority blockers as warning", () => {
    expect(resolvePriorityColor(70)).toBe("warning");
    expect(resolvePriorityColor(84)).toBe("warning");
  });

  it("should mark low priority blockers as default", () => {
    expect(resolvePriorityColor(0)).toBe("default");
    expect(resolvePriorityColor(69)).toBe("default");
  });
});
