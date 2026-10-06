import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useGuidedPresets } from "./useGuidedPresets";
import type { GuidedPreset } from "./useGuidedPresets.types";

const PRESETS: ReadonlyArray<GuidedPreset> = [
  {
    id: "demo",
    label: "Demo",
    description: "Demo preset",
    blockers: [
      {
        id: "demo-blocker",
        config: {
          scope: "checkout",
          reason: "Demo blocker",
          priority: 10,
        },
      },
    ],
  },
];

describe("useGuidedPresets", () => {
  it("should clear preset blockers when the preset owner unmounts", () => {
    const { result, unmount } = renderHook(() => useGuidedPresets({ presets: PRESETS }));

    act(() => {
      result.current.applyPreset(PRESETS[0]);
    });

    expect(uiBlockingStoreApi.getState().isBlocked("checkout")).toBe(true);

    unmount();

    expect(uiBlockingStoreApi.getState().isBlocked("checkout")).toBe(false);
  });
});
