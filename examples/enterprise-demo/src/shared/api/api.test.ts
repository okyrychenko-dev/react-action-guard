import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { delayApiResponse } from "./api.utils";

describe("shared api", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should abort delayed API responses", async () => {
    const controller = new AbortController();
    const request = delayApiResponse(1000, controller.signal);

    controller.abort();

    await expect(request).rejects.toMatchObject({ name: "AbortError" });
  });
});
