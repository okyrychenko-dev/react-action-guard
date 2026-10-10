import { UIBlockingProvider, useResolvedStoreApi } from "@okyrychenko-dev/react-action-guard";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useGuardedControl } from "./useGuardedControl";

describe("guarded metadata observation", () => {
  it("should skip unrelated renders and keep observing reasons through inline scope arrays", () => {
    let renders = 0;
    const { result, rerender, unmount } = renderHook(
      () => {
        const store = useResolvedStoreApi();
        const control = useGuardedControl({
          kind: "action",
          scope: ["checkout", "profile"],
          reasonMode: "visible",
        });

        renders++;

        return { store, control };
      },
      { wrapper: UIBlockingProvider }
    );
    const { store } = result.current;
    const { addBlocker, updateBlocker, removeBlocker } = store.getState();

    act(() =>
      addBlocker("save", { scope: ["checkout", "profile"], reason: "Saving", priority: 20 })
    );

    const { control: originalControl } = result.current;
    const { blocker: originalBlocker } = originalControl;
    const { blockers: previous } = originalBlocker;
    const previousRenders = renders;

    expect(previous).toHaveLength(1);
    expect(originalControl.reasonContent).toBe("Saving");
    act(() => addBlocker("sync", { scope: "inventory" }));
    act(() => updateBlocker("sync", { reason: "Syncing" }));
    act(() => removeBlocker("sync"));
    expect(result.current.control.blocker.blockers).toBe(previous);
    expect(renders).toBe(previousRenders);

    rerender();
    expect(result.current.control.blocker.blockers).toBe(previous);
    act(() => updateBlocker("save", { reason: "Uploading" }));

    const { control: uploadingControl } = result.current;
    const { reasonContent: uploadingReason, controlState: uploadingState } = uploadingControl;

    expect(uploadingReason).toBe("Uploading");
    expect(uploadingState.disabled).toBe(true);
    expect(previous[0]?.reason).toBe("Saving");
    act(() => removeBlocker("save"));

    const { control: idleControl } = result.current;
    const { controlState: idleState, reasonContent: idleReason } = idleControl;

    expect(idleState.disabled).toBe(false);
    expect(idleReason).toBeNull();
    unmount();
  });
});
