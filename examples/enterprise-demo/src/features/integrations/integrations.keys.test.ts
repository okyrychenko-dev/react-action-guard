import { describe, expect, it } from "vitest";
import { integrationKeys } from "./integrations.keys";

describe("integrationKeys", () => {
  it("should build stable inventory query keys", () => {
    expect(integrationKeys.all).toEqual(["integrations"]);
    expect(integrationKeys.inventory()).toEqual(["integrations", "inventory"]);
    expect(integrationKeys.inventorySnapshot()).toEqual(["integrations", "inventory", "snapshot"]);
  });

  it("should build stable payment gateway query keys", () => {
    expect(integrationKeys.paymentGateway()).toEqual(["integrations", "payment-gateway"]);
    expect(integrationKeys.paymentGatewayHealth()).toEqual([
      "integrations",
      "payment-gateway",
      "health",
    ]);
  });

  it("should build stable price catalog mutation keys", () => {
    expect(integrationKeys.priceCatalog()).toEqual(["integrations", "price-catalog"]);
    expect(integrationKeys.priceCatalogPush()).toEqual(["integrations", "price-catalog", "push"]);
  });
});
