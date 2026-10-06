import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchOrders } from "./orders.api";

describe("orders api", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should fetch orders from the orders feature API", async () => {
    const request = fetchOrders();

    await vi.advanceTimersByTimeAsync(1200);

    await expect(request).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "ENT-10042", status: "flagged" })])
    );
  });
});
