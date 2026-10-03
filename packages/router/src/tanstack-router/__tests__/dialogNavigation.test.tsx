import { StrictMode, useCallback } from "react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDialogState } from "../../core";
import { useNavigationBlocker } from "../../tanstack-router";
import type { DialogState } from "../../core";
import type { RouterHistory } from "@tanstack/react-router";

const histories: Array<RouterHistory> = [];

async function mountDialogNavigation() {
  const outcomes: Array<boolean> = [];
  const onBlock = vi.fn();
  const onAllow = vi.fn();
  let currentDialog: DialogState | null = null;

  function Root() {
    const { dialogState, confirm, onConfirm, onCancel } = useDialogState();
    const requestConfirmation = useCallback(
      (message: string) => {
        const promise = confirm(message);

        void promise.then((outcome) => outcomes.push(outcome));

        return promise;
      },
      [confirm]
    );

    currentDialog = dialogState;

    useNavigationBlocker({
      when: true,
      message: "Leave editor?",
      onConfirm: requestConfirmation,
      onBlock,
      onAllow,
    });

    return (
      <>
        <Outlet />
        {dialogState && (
          <div role="dialog" aria-label={dialogState.message}>
            <button onClick={onConfirm}>Leave</button>
            <button onClick={onCancel}>Stay</button>
          </div>
        )}
      </>
    );
  }

  const history = createMemoryHistory({ initialEntries: ["/"] });
  const root = createRootRoute({ component: Root });
  const routes = ["/", "/next", "/other"].map((path) =>
    createRoute({ getParentRoute: () => root, path, component: () => <div>Editor</div> })
  );
  const router = createRouter({ routeTree: root.addChildren(routes), history });

  histories.push(history);

  await router.load();

  const view = render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );

  await waitFor(() => expect(view.getByText("Editor")).toBeTruthy());

  async function navigate(to: string) {
    await act(async () => {
      history.push(to);
    });

    await waitFor(() => expect(view.getByRole("dialog")).toBeTruthy());
  }

  function captureDialog() {
    if (!currentDialog) {
      throw new Error("Expected an open dialog");
    }

    return currentDialog;
  }

  return { ...view, router, navigate, outcomes, onBlock, onAllow, captureDialog };
}

afterEach(() => {
  cleanup();
  histories.splice(0).forEach((history) => history.destroy());
});

describe("TanStack navigation with a custom dialog", () => {
  it("should settle a replaced request false and only allow the current destination", async () => {
    const { router, navigate, captureDialog, outcomes, onAllow, onBlock, queryByRole } =
      await mountDialogNavigation();

    await navigate("/next");

    const first = captureDialog();

    await navigate("/other");

    expect(outcomes).toEqual([false]);

    const second = captureDialog();

    await act(async () => {
      first.resolve(true);
    });

    expect(router.state.location.pathname).toBe("/");
    expect(queryByRole("dialog")).toBeTruthy();
    expect(outcomes).toEqual([false]);
    expect(onAllow).not.toHaveBeenCalled();

    await act(async () => {
      second.resolve(true);
      second.resolve(false);
    });

    await waitFor(() => expect(router.state.location.pathname).toBe("/other"));

    expect(outcomes).toEqual([false, true]);
    expect(queryByRole("dialog")).toBeNull();
    expect(onAllow).toHaveBeenCalledTimes(1);
    expect(onBlock).toHaveBeenCalledTimes(2);
  });

  it("should settle an unmounted dialog false without replaying its destination", async () => {
    const { router, navigate, captureDialog, outcomes, onAllow, unmount } =
      await mountDialogNavigation();

    await navigate("/next");

    const pending = captureDialog();

    await act(async () => {
      unmount();
    });

    expect(outcomes).toEqual([false]);
    expect(router.history.location.pathname).toBe("/");

    await act(async () => {
      pending.resolve(true);
    });

    expect(outcomes).toEqual([false]);
    expect(router.history.location.pathname).toBe("/");
    expect(onAllow).not.toHaveBeenCalled();
  });

  it("should cancel and confirm real transitions while protecting later navigation", async () => {
    const { router, navigate, getByRole, queryByRole, outcomes, onBlock, onAllow } =
      await mountDialogNavigation();

    await navigate("/next");

    expect(router.state.location.pathname).toBe("/");

    await act(async () => {
      fireEvent.click(getByRole("button", { name: "Stay" }));
    });

    expect(outcomes).toEqual([false]);
    expect(router.state.location.pathname).toBe("/");
    expect(queryByRole("dialog")).toBeNull();
    expect(onAllow).not.toHaveBeenCalled();

    await navigate("/next");

    await act(async () => {
      fireEvent.click(getByRole("button", { name: "Leave" }));
    });

    await waitFor(() => expect(router.state.location.pathname).toBe("/next"));

    expect(outcomes).toEqual([false, true]);
    expect(queryByRole("dialog")).toBeNull();
    expect(onAllow).toHaveBeenCalledTimes(1);

    await navigate("/other");

    await act(async () => {
      fireEvent.click(getByRole("button", { name: "Stay" }));
    });

    expect(router.state.location.pathname).toBe("/next");
    expect(outcomes).toEqual([false, true, false]);
    expect(onBlock).toHaveBeenCalledTimes(3);
    expect(onAllow).toHaveBeenCalledTimes(1);
  });
});
