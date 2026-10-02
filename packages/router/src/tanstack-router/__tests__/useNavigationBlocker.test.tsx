import { createContext, useContext } from "react";
import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { UseNavigationBlockerOptions } from "../types";
import { useNavigationBlocker } from "../useNavigationBlocker";

const OptionsContext = createContext<UseNavigationBlockerOptions>({});

async function mountBlocker(options: UseNavigationBlockerOptions) {
  function Root() {
    useNavigationBlocker(useContext(OptionsContext));

    return <Outlet />;
  }

  const root = createRootRoute({ component: Root });
  const routes = ["/", "/next", "/other"].map((path) =>
    createRoute({ getParentRoute: () => root, path, component: () => <div>Destination</div> })
  );
  const router = createRouter({
    routeTree: root.addChildren(routes),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });

  await router.load();

  const view = render(
    <OptionsContext.Provider value={options}>
      <RouterProvider router={router} />
    </OptionsContext.Provider>
  );

  await waitFor(() => expect(view.getByText("Destination")).toBeTruthy());
  function update(next: UseNavigationBlockerOptions) {
    view.rerender(
      <OptionsContext.Provider value={next}>
        <RouterProvider router={router} />
      </OptionsContext.Provider>
    );
  }

  return { router, update, ...view };
}

async function transition(
  router: Awaited<ReturnType<typeof mountBlocker>>["router"],
  destination: string
) {
  await act(async () => {
    router.history.push(destination);
    await Promise.resolve();
    await Promise.resolve();
  });
}

function deferred() {
  let resolve: (value: boolean) => void = () => undefined;
  let reject: (error: Error) => void = () => undefined;
  const promise = new Promise<boolean>((accept, deny) => {
    resolve = accept;
    reject = deny;
  });

  return { promise, resolve, reject };
}

afterEach(() => {
  cleanup();

  const { clearAllBlockers } = uiBlockingStoreApi.getState();

  clearAllBlockers();
});

describe("TanStack navigation blocking with a real router", () => {
  it("should deny silent navigation and report the attempt", async () => {
    const onBlock = vi.fn();
    const { router } = await mountBlocker({ when: true, onBlock });

    await act(async () => {
      router.history.push("/next");
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(router.state.location.pathname).toBe("/");
    expect(onBlock).toHaveBeenCalledTimes(1);
  });

  it("should allow inactive navigation without confirmation callbacks", async () => {
    const onConfirm = vi.fn(() => false);
    const onBlock = vi.fn();
    const onAllow = vi.fn();
    const { router } = await mountBlocker({
      when: false,
      message: "Leave?",
      onConfirm,
      onBlock,
      onAllow,
    });

    await transition(router, "/next");
    await waitFor(() => expect(router.state.location.pathname).toBe("/next"));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onBlock).not.toHaveBeenCalled();
    expect(onAllow).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    "should obey synchronous confirmation %s and protect later transitions",
    async (confirmed) => {
      const onConfirm = vi.fn(() => confirmed);
      const onAllow = vi.fn();
      const { router } = await mountBlocker({ when: true, message: "Leave?", onConfirm, onAllow });

      await transition(router, "/next");
      await waitFor(() => expect(router.state.location.pathname).toBe(confirmed ? "/next" : "/"));
      onConfirm.mockReturnValue(false);
      await transition(router, "/other");
      expect(router.state.location.pathname).toBe(confirmed ? "/next" : "/");
      expect(onConfirm).toHaveBeenCalledTimes(2);
      expect(onAllow).toHaveBeenCalledTimes(confirmed ? 1 : 0);
    }
  );

  it.each(["accept", "deny", "reject"])("should obey asynchronous %s", async (outcome) => {
    const pending = deferred();
    const onAllow = vi.fn();
    const onConfirm = vi.fn(() => pending.promise);
    const { router } = await mountBlocker({ when: true, message: "Leave?", onConfirm, onAllow });

    await transition(router, "/next");
    expect(router.state.location.pathname).toBe("/");
    await act(async () => {
      if (outcome === "reject") {
        pending.reject(new Error("Dialog failed"));
      } else {
        pending.resolve(outcome === "accept");
      }
      await Promise.resolve();
    });
    await waitFor(() =>
      expect(router.state.location.pathname).toBe(outcome === "accept" ? "/next" : "/")
    );
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onAllow).toHaveBeenCalledTimes(outcome === "accept" ? 1 : 0);
  });

  it("should ignore a superseded confirmation", async () => {
    const first = deferred();
    const second = deferred();
    const onConfirm = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const onAllow = vi.fn();
    const { router } = await mountBlocker({ when: true, message: "Leave?", onConfirm, onAllow });

    await transition(router, "/next");
    await transition(router, "/other");
    await act(async () => {
      first.resolve(true);
      await Promise.resolve();
    });
    expect(router.state.location.pathname).toBe("/");
    expect(onAllow).not.toHaveBeenCalled();
    await act(async () => {
      second.resolve(true);
      await Promise.resolve();
    });
    await waitFor(() => expect(router.state.location.pathname).toBe("/other"));
    expect(onAllow).toHaveBeenCalledTimes(1);
  });

  it("should deny a late confirmation after unmount", async () => {
    const pending = deferred();
    const onAllow = vi.fn();
    const { router, unmount } = await mountBlocker({
      when: true,
      message: "Leave?",
      onConfirm: () => pending.promise,
      onAllow,
    });

    await transition(router, "/next");
    unmount();
    await act(async () => {
      pending.resolve(true);
      await Promise.resolve();
    });
    expect(router.history.location.pathname).toBe("/");
    expect(onAllow).not.toHaveBeenCalled();
  });

  it("should deny a thrown confirmation and retain protection", async () => {
    const onConfirm = vi.fn(() => {
      throw new Error("Dialog failed");
    });
    const { router } = await mountBlocker({ when: true, message: "Leave?", onConfirm });

    await transition(router, "/next");
    await transition(router, "/other");
    expect(router.state.location.pathname).toBe("/");
    expect(onConfirm).toHaveBeenCalledTimes(2);
  });

  it("should invalidate pending confirmation when options change", async () => {
    const pending = deferred();
    const onAllow = vi.fn();
    const { router, update } = await mountBlocker({
      when: true,
      message: "Old",
      onConfirm: () => pending.promise,
      onAllow,
    });

    await transition(router, "/next");
    update({ when: true, message: "New", onConfirm: () => false, onAllow });
    await act(async () => {
      pending.resolve(true);
      await Promise.resolve();
    });
    expect(router.state.location.pathname).toBe("/");
    expect(onAllow).not.toHaveBeenCalled();
    await transition(router, "/other");
    expect(router.state.location.pathname).toBe("/");
  });

  it("should derive blocking from the selected scope", async () => {
    const { addBlocker } = uiBlockingStoreApi.getState();

    addBlocker("editor", { scope: "editor" });

    const { router, update } = await mountBlocker({ scope: "editor" });

    await transition(router, "/next");
    expect(router.state.location.pathname).toBe("/");
    update({ scope: "other" });
    await transition(router, "/next");
    await waitFor(() => expect(router.state.location.pathname).toBe("/next"));
  });

  it.each([true, false])("should honor browser unload option %s", async (blockBrowserUnload) => {
    await mountBlocker({ when: true, blockBrowserUnload });

    const event = new Event("beforeunload", { cancelable: true });

    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(blockBrowserUnload);
  });
});
