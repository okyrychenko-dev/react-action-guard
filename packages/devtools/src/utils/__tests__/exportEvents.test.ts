import { describe, expect, it, vi } from "vitest";
import { copyEventsToClipboard, serializeEvents } from "../exportEvents";
import type { DevtoolsEvent } from "../../types";

const sampleEvents: Array<DevtoolsEvent> = [
  {
    id: "event-1",
    action: "add",
    blockerId: "blocker-1",
    timestamp: 1_000,
    config: { scope: "global", reason: "Loading", priority: 10 },
  },
  {
    id: "event-2",
    action: "remove",
    blockerId: "blocker-2",
    timestamp: 2_000,
    duration: 500,
  },
];

describe("serializeEvents", () => {
  it("should wrap events with export metadata", () => {
    const json = serializeEvents(sampleEvents, "2026-01-01T00:00:00.000Z");

    expect(JSON.parse(json)).toEqual({
      exportedAt: "2026-01-01T00:00:00.000Z",
      count: 2,
      events: sampleEvents,
    });
  });

  it("should pretty-print with two-space indentation", () => {
    const json = serializeEvents(sampleEvents, "2026-01-01T00:00:00.000Z");

    expect(json).toContain('\n  "count": 2');
  });

  it("should report a zero count for an empty timeline", () => {
    const json = serializeEvents([], "2026-01-01T00:00:00.000Z");

    expect(JSON.parse(json)).toEqual({
      exportedAt: "2026-01-01T00:00:00.000Z",
      count: 0,
      events: [],
    });
  });
});

describe("copyEventsToClipboard", () => {
  it("should write serialized events and resolve true on success", async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    const result = await copyEventsToClipboard(sampleEvents);

    expect(result).toBe(true);
    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText.mock.calls[0][0]).toContain('"count": 2');

    vi.unstubAllGlobals();
  });

  it("should resolve false when the clipboard write rejects", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    const result = await copyEventsToClipboard(sampleEvents);

    expect(result).toBe(false);

    vi.unstubAllGlobals();
  });
});
