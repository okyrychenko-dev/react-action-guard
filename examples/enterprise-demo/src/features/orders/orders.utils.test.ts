import { describe, expect, it } from "vitest";
import {
  formatAmount,
  getRiskChipColor,
  getRiskLabel,
  getStatusChipColor,
  getStatusLabel,
} from "./orders.utils";

describe("orders utils", () => {
  it("should format order amounts as US dollars", () => {
    expect(formatAmount(1234)).toBe("$1,234");
    expect(formatAmount(99.5)).toBe("$100");
  });

  it("should resolve status labels and chip colors", () => {
    expect(getStatusLabel("pending")).toBe("Pending");
    expect(getStatusChipColor("pending")).toBe("default");
    expect(getStatusLabel("processing")).toBe("Processing");
    expect(getStatusChipColor("processing")).toBe("warning");
    expect(getStatusLabel("completed")).toBe("Completed");
    expect(getStatusChipColor("completed")).toBe("success");
    expect(getStatusLabel("flagged")).toBe("Flagged");
    expect(getStatusChipColor("flagged")).toBe("danger");
  });

  it("should resolve risk labels and chip colors", () => {
    expect(getRiskLabel("low")).toBe("Low");
    expect(getRiskChipColor("low")).toBe("success");
    expect(getRiskLabel("medium")).toBe("Medium");
    expect(getRiskChipColor("medium")).toBe("warning");
    expect(getRiskLabel("high")).toBe("High");
    expect(getRiskChipColor("high")).toBe("danger");
  });
});
