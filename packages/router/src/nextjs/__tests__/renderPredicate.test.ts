import { renderHook, cleanup } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { useAppRouterBlocker } from "../../nextjs";

afterEach(cleanup);

describe("App Router render-time predicate", () => {
  it("should refresh unload protection in both directions after rerender", () => {
    const { result, rerender, unmount } = renderHook(() => {
      const dirty = useRef(false);
      const predicate = useRef(() => dirty.current);
      const protection = useAppRouterBlocker({ when: predicate.current });

      return { dirty, protection };
    });
    const unload = (): boolean => {
      const event = new Event("beforeunload", { cancelable: true });

      window.dispatchEvent(event);

      return event.defaultPrevented;
    };

    expect(result.current.protection.isBlocking).toBe(false);
    expect(unload()).toBe(false);

    result.current.dirty.current = true;

    expect(unload()).toBe(false);

    rerender();

    expect(result.current.protection.isBlocking).toBe(true);
    expect(unload()).toBe(true);

    result.current.dirty.current = false;

    rerender();

    expect(result.current.protection.isBlocking).toBe(false);
    expect(unload()).toBe(false);

    result.current.dirty.current = true;

    rerender();

    expect(unload()).toBe(true);
    unmount();
    expect(unload()).toBe(false);
  });
});
