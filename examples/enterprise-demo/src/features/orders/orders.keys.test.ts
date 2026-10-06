import { describe, expect, it } from "vitest";
import { orderKeys } from "./orders.keys";

describe("orderKeys", () => {
  it("should build stable order query keys", () => {
    expect(orderKeys.all).toEqual(["orders"]);
    expect(orderKeys.lists()).toEqual(["orders", "list"]);
    expect(orderKeys.list()).toEqual(["orders", "list", "all"]);
  });

  it("should build stable order mutation keys", () => {
    expect(orderKeys.exports()).toEqual(["orders", "exports"]);
    expect(orderKeys.exportToErp()).toEqual(["orders", "exports", "erp"]);
  });
});
