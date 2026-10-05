import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  exportOrdersToErp,
  fetchInventorySnapshot,
  pushPriceUpdate,
  validatePaymentGateway,
} from "./integrations.api";

describe("integrations api", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-10T09:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should export completed orders to ERP", async () => {
    const request = exportOrdersToErp();

    await vi.advanceTimersByTimeAsync(2500);

    await expect(request).resolves.toEqual({
      exportedAt: Date.now(),
      exportedCount: 3,
    });
  });

  it("should fetch integration snapshots and mutation responses", async () => {
    const inventoryRequest = fetchInventorySnapshot();
    const gatewayRequest = validatePaymentGateway();
    const priceRequest = pushPriceUpdate();

    await vi.advanceTimersByTimeAsync(2000);

    await expect(inventoryRequest).resolves.toEqual({
      items: 2847,
      reserved: 312,
      timestamp: expect.any(Number),
    });
    await expect(gatewayRequest).resolves.toEqual({
      latency: 42,
      status: "ok",
      checkedAt: expect.any(Number),
    });
    await expect(priceRequest).resolves.toEqual({
      pushedAt: expect.any(Number),
      catalogVersion: "catalog-2026.05",
    });
  });
});
