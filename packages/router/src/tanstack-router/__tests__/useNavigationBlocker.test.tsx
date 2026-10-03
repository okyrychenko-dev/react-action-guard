import { createContext, useContext } from "react";
import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import {
  createMemoryHistory,
  createBrowserHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useNavigationBlocker } from "../../tanstack-router";
import type { UseNavigationBlockerOptions } from "../../tanstack-router";
import type { RouterHistory } from "@tanstack/react-router";

const OptionsContext = createContext<UseNavigationBlockerOptions>({});
const histories: Array<RouterHistory> = [];

async function mountBlocker(
  options: UseNavigationBlockerOptions,
  history = createMemoryHistory({ initialEntries: ["/"] })
) {
  function Root() {
    useNavigationBlocker(useContext(OptionsContext));

    return <Outlet />;
  }

  const root = createRootRoute({
    component: Root,
    notFoundComponent: () => <div>Not found</div>,
  });
  const routes = ["/", "/next", "/other"].map((path) =>
    createRoute({ getParentRoute: () => root, path, component: () => <div>Destination</div> })
  );
  const router = createRouter({
    routeTree: root.addChildren(routes),
    history,
  });

  histories.push(history);
  await router.load();

  const view = render(
    <OptionsContext.Provider value={options}>
      <RouterProvider router={router} />
    </OptionsContext.Provider>
  );

  await waitFor(() => expect(view.getByText(/^(Destination|Not found)$/)).toBeTruthy());
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
  histories.splice(0).forEach((history) => history.destroy());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();

  const { clearAllBlockers } = uiBlockingStoreApi.getState();

  clearAllBlockers();
});

describe("TanStack navigation blocking with a real router", () => {
  it.each(["when", "scope"])(
    "should expose native not-found bypass with active %s and guard subsequent matched navigation",
    async (condition) => {
      const onBlock = vi.fn();
      const onConfirm = vi.fn(() => false);
      const onAllow = vi.fn();
      const { addBlocker } = uiBlockingStoreApi.getState();

      if (condition === "scope") {
        addBlocker("editor", { scope: "editor" });
      }

      const { router, getByText } = await mountBlocker(
        {
          when: condition === "when",
          scope: condition === "scope" ? "editor" : undefined,
          message: "Leave?",
          onBlock,
          onConfirm,
          onAllow,
        },
        createMemoryHistory({ initialEntries: ["/missing"] })
      );

      expect(getByText("Not found")).toBeTruthy();
      await transition(router, "/next");
      await waitFor(() => expect(router.state.location.pathname).toBe("/next"));
      expect(onBlock).not.toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
      expect(onAllow).not.toHaveBeenCalled();

      await transition(router, "/other");
      expect(router.state.location.pathname).toBe("/next");
      expect(onBlock).toHaveBeenCalledTimes(1);
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onAllow).not.toHaveBeenCalled();
    }
  );

  it("should skip one unload prompt after allowing external navigation", async () => {
    const onConfirm = vi.fn(() => true);
    const onAllow = vi.fn();
    const { router } = await mountBlocker(
      { when: true, message: "Leave editor?", onConfirm, onAllow },
      createBrowserHistory()
    );
    const unload = new Event("beforeunload", { cancelable: true });

    vi.spyOn(window.location, "href", "set").mockImplementation(() => {
      window.dispatchEvent(unload);
    });

    await act(async () => {
      await router.navigate({ href: "https://external.example/next" });
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onAllow).toHaveBeenCalledTimes(1);
    expect(unload.defaultPrevented).toBe(false);

    const laterUnload = new Event("beforeunload", { cancelable: true });

    window.dispatchEvent(laterUnload);
    expect(laterUnload.defaultPrevented).toBe(true);
  });

  it.each(["accept", "deny", "reject"])(
    "should preserve unload protection after asynchronous external %s",
    async (outcome) => {
      const pending = deferred();
      const onAllow = vi.fn();
      const { router } = await mountBlocker(
        { when: true, message: "Leave?", onConfirm: () => pending.promise, onAllow },
        createBrowserHistory()
      );
      const unload = new Event("beforeunload", { cancelable: true });
      const assignLocation = vi.spyOn(window.location, "href", "set").mockImplementation(() => {
        window.dispatchEvent(unload);
      });
      let navigation = Promise.resolve();

      await act(async () => {
        navigation = router.navigate({ href: "https://external.example/next" });
        await Promise.resolve();
      });

      expect(assignLocation).not.toHaveBeenCalled();
      await act(async () => {
        if (outcome === "reject") {
          pending.reject(new Error("Confirmation failed"));
        } else {
          pending.resolve(outcome === "accept");
        }
        await navigation;
      });

      expect(assignLocation).toHaveBeenCalledTimes(outcome === "accept" ? 1 : 0);
      expect(onAllow).toHaveBeenCalledTimes(outcome === "accept" ? 1 : 0);
      expect(unload.defaultPrevented).toBe(false);

      const laterUnload = new Event("beforeunload", { cancelable: true });

      window.dispatchEvent(laterUnload);
      expect(laterUnload.defaultPrevented).toBe(true);
    }
  );

  it("should retain unload protection after allowing internal navigation", async () => {
    const { router } = await mountBlocker(
      { when: true, message: "Leave?", onConfirm: () => true },
      createBrowserHistory()
    );

    await transition(router, "/next");
    await waitFor(() => expect(router.state.location.pathname).toBe("/next"));

    const unload = new Event("beforeunload", { cancelable: true });

    window.dispatchEvent(unload);
    expect(unload.defaultPrevented).toBe(true);
  });

  it.each([true, false])(
    "should obey browser confirmation %s without a custom handler",
    async (confirmed) => {
      const confirm = vi.fn(() => confirmed);

      vi.stubGlobal("confirm", confirm);

      const onBlock = vi.fn();
      const onAllow = vi.fn();
      const { router } = await mountBlocker({
        when: true,
        message: "Leave editor?",
        onBlock,
        onAllow,
      });

      await transition(router, "/next");
      await waitFor(() => expect(router.state.location.pathname).toBe(confirmed ? "/next" : "/"));
      expect(confirm).toHaveBeenCalledExactlyOnceWith("Leave editor?");
      expect(onBlock).toHaveBeenCalledTimes(1);
      expect(onAllow).toHaveBeenCalledTimes(confirmed ? 1 : 0);
    }
  );

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

  it.each(["onBlock", "onAllow"])(
    "should accept pending confirmation when inline %s changes after opening confirmation UI",
    async (observer) => {
      const pending = deferred();
      const onBlock = vi.fn();
      const onAllow = vi.fn();
      const options: UseNavigationBlockerOptions = {
        when: true,
        message: "Leave?",
        onBlock: () => onBlock(),
        onAllow: () => onAllow(),
        onConfirm: vi.fn(() => {
          update({
            ...options,
            [observer]: () => (observer === "onBlock" ? onBlock() : onAllow()),
          });

          return pending.promise;
        }),
      };
      const { router, update } = await mountBlocker(options);

      await transition(router, "/next");
      expect(router.state.location.pathname).toBe("/");

      await act(async () => {
        pending.resolve(true);
        await Promise.resolve();
      });
      await waitFor(() => expect(router.state.location.pathname).toBe("/next"));
      expect(options.onConfirm).toHaveBeenCalledTimes(1);
      expect(onBlock).toHaveBeenCalledTimes(1);
      expect(onAllow).toHaveBeenCalledTimes(1);
    }
  );

  it.each([
    ["same contents", ["first", "second"]],
    ["reordered and duplicated contents", ["second", "first", "second"]],
  ])("should preserve pending confirmation for scope arrays with %s", async (_, scope) => {
    const pending = deferred();
    const onAllow = vi.fn();
    const { addBlocker } = uiBlockingStoreApi.getState();

    addBlocker("editor", { scope: "first" });

    const options: UseNavigationBlockerOptions = {
      scope: ["first", "second"],
      message: "Leave?",
      onAllow,
      onConfirm: vi.fn(() => {
        update({ ...options, scope });

        return pending.promise;
      }),
    };
    const { router, update } = await mountBlocker(options);

    await transition(router, "/next");

    await act(async () => {
      pending.resolve(true);
      await Promise.resolve();
    });
    await waitFor(() => expect(router.state.location.pathname).toBe("/next"));
    expect(options.onConfirm).toHaveBeenCalledTimes(1);
    expect(onAllow).toHaveBeenCalledTimes(1);
  });

  it("should invalidate pending confirmation when scope array contents change", async () => {
    const pending = deferred();
    const onAllow = vi.fn();
    const { addBlocker } = uiBlockingStoreApi.getState();

    addBlocker("first-editor", { scope: "first" });
    addBlocker("second-editor", { scope: "second" });

    const options: UseNavigationBlockerOptions = {
      scope: ["first"],
      message: "Leave?",
      onAllow,
      onConfirm: () => pending.promise,
    };
    const { router, update } = await mountBlocker(options);

    await transition(router, "/next");
    update({ ...options, scope: ["second"] });

    await act(async () => {
      pending.resolve(true);
      await Promise.resolve();
    });
    expect(router.state.location.pathname).toBe("/");
    expect(onAllow).not.toHaveBeenCalled();

    await transition(router, "/other");
    await waitFor(() => expect(router.state.location.pathname).toBe("/other"));
    expect(onAllow).toHaveBeenCalledTimes(1);
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

  it.each(["scope", "when"])(
    "should invalidate pending confirmation when %s changes while blocking remains active",
    async (source) => {
      const pending = deferred();
      const onConfirm = vi.fn(() => pending.promise);
      const onAllow = vi.fn();
      const { addBlocker } = uiBlockingStoreApi.getState();

      addBlocker("first-editor", { scope: "first" });
      addBlocker("second-editor", { scope: "second" });

      const options: UseNavigationBlockerOptions = {
        scope: "first",
        when: source === "when" ? () => true : false,
        message: "Leave?",
        onConfirm,
        onAllow,
      };
      const { router, update } = await mountBlocker(options);

      await transition(router, "/next");

      if (source === "scope") {
        update({ ...options, scope: "second" });
      } else {
        update({ ...options, when: () => true });
      }

      await act(async () => {
        pending.resolve(true);
        await Promise.resolve();
      });

      expect(router.state.location.pathname).toBe("/");
      expect(onAllow).not.toHaveBeenCalled();

      await transition(router, "/other");
      await waitFor(() => expect(router.state.location.pathname).toBe("/other"));

      expect(onConfirm).toHaveBeenCalledTimes(2);
      expect(onAllow).toHaveBeenCalledTimes(1);
    }
  );

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
    await mountBlocker({ when: true, blockBrowserUnload }, createBrowserHistory());

    const event = new Event("beforeunload", { cancelable: true });

    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(blockBrowserUnload);
  });
});
