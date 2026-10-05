import { describe, expect, it } from "vitest";
import { isNavPathActive } from "./Sidebar.utils";

describe("Sidebar utils", () => {
  it("should match the dashboard route exactly", () => {
    expect(isNavPathActive("/", "/")).toBe(true);
    expect(isNavPathActive("/checkout", "/")).toBe(false);
  });

  it("should match nested feature routes by prefix", () => {
    expect(isNavPathActive("/checkout", "/checkout")).toBe(true);
    expect(isNavPathActive("/checkout/review", "/checkout")).toBe(true);
    expect(isNavPathActive("/orders", "/checkout")).toBe(false);
  });
});
