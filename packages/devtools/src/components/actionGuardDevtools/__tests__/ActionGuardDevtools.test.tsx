import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_FILTER, DEFAULT_MAX_EVENTS, DEFAULT_TAB, devtoolsStoreApi } from "../../../store";
import { renderWithProviders } from "../../../test/utils";
import ActionGuardDevtools from "../ActionGuardDevtools";
import ActionGuardDevtoolsContent from "../ActionGuardDevtoolsContent";
import type { DevtoolsEvent } from "../../../types";

function resetDevtoolsStore(): void {
  devtoolsStoreApi.setState({
    events: [],
    maxEvents: DEFAULT_MAX_EVENTS,
    isOpen: false,
    isMinimized: false,
    activeTab: DEFAULT_TAB,
    filter: DEFAULT_FILTER,
    selectedEventId: null,
    isPaused: false,
  });
}

describe("ActionGuardDevtools", () => {
  beforeEach(() => {
    resetDevtoolsStore();
    uiBlockingStoreApi.getState().clearAllBlockers();
  });

  it("should render toggle button when closed", () => {
    renderWithProviders(<ActionGuardDevtools />);

    expect(screen.getByTitle("Open Action Guard Devtools")).toBeInTheDocument();
    expect(screen.queryByText("Action Guard")).not.toBeInTheDocument();
  });

  it("should open panel on toggle click", async () => {
    renderWithProviders(<ActionGuardDevtools />);

    fireEvent.click(screen.getByTitle("Open Action Guard Devtools"));

    await waitFor(() => {
      expect(screen.getByText("Action Guard")).toBeInTheDocument();
    });

    expect(screen.getByTitle("Close")).toBeInTheDocument();
    expect(screen.queryByTitle("Open Action Guard Devtools")).not.toBeInTheDocument();
  });

  it("should respect defaultOpen", async () => {
    renderWithProviders(<ActionGuardDevtools defaultOpen={true} />);

    await waitFor(() => {
      expect(screen.getByText("Action Guard")).toBeInTheDocument();
    });

    expect(screen.queryByTitle("Open Action Guard Devtools")).not.toBeInTheDocument();
  });

  it("should preserve manually changed open state when maxEvents changes", async () => {
    const { rerender } = renderWithProviders(<ActionGuardDevtools maxEvents={100} />);

    fireEvent.click(screen.getByTitle("Open Action Guard Devtools"));

    await waitFor(() => {
      expect(screen.getByText("Action Guard")).toBeInTheDocument();
    });

    rerender(<ActionGuardDevtools maxEvents={300} />);

    expect(screen.getByText("Action Guard")).toBeInTheDocument();
    expect(devtoolsStoreApi.getState().maxEvents).toBe(300);
  });

  it("should handle keyboard shortcuts", async () => {
    const events: Array<DevtoolsEvent> = [
      {
        id: "event-1",
        action: "add",
        blockerId: "blocker-1",
        timestamp: Date.now(),
      },
      {
        id: "event-2",
        action: "remove",
        blockerId: "blocker-2",
        timestamp: Date.now(),
      },
    ];
    devtoolsStoreApi.setState({ events });

    renderWithProviders(<ActionGuardDevtools defaultOpen={true} />);

    await waitFor(() => {
      expect(screen.getByText("Action Guard")).toBeInTheDocument();
    });

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByTitle("Pause recording")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: " " });
    expect(screen.getByTitle("Resume recording")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "c" });
    expect(screen.getByText("0")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByText("Action Guard")).not.toBeInTheDocument();
    });
    expect(screen.getByTitle("Open Action Guard Devtools")).toBeInTheDocument();
  });

  it("should ignore keyboard shortcuts from content editable elements", async () => {
    const events: Array<DevtoolsEvent> = [
      {
        id: "event-1",
        action: "add",
        blockerId: "blocker-1",
        timestamp: Date.now(),
      },
    ];
    const editableElement = document.createElement("div");

    editableElement.contentEditable = "true";
    document.body.appendChild(editableElement);
    devtoolsStoreApi.setState({ events });

    renderWithProviders(<ActionGuardDevtools defaultOpen={true} />);

    await waitFor(() => {
      expect(screen.getByText("Action Guard")).toBeInTheDocument();
    });

    fireEvent.keyDown(editableElement, { key: "c" });

    expect(devtoolsStoreApi.getState().events).toHaveLength(1);

    editableElement.remove();
  });

  it("should ignore keyboard shortcuts from select elements", async () => {
    const events: Array<DevtoolsEvent> = [
      {
        id: "event-1",
        action: "add",
        blockerId: "blocker-1",
        timestamp: Date.now(),
      },
    ];
    const selectElement = document.createElement("select");

    document.body.appendChild(selectElement);
    devtoolsStoreApi.setState({ events });

    renderWithProviders(<ActionGuardDevtools defaultOpen={true} />);

    await waitFor(() => {
      expect(screen.getByText("Action Guard")).toBeInTheDocument();
    });

    fireEvent.keyDown(selectElement, { key: "c" });

    expect(devtoolsStoreApi.getState().events).toHaveLength(1);

    selectElement.remove();
  });

  it("should record each event once and keep middleware alive across instances", () => {
    const first = renderWithProviders(<ActionGuardDevtools />);
    renderWithProviders(<ActionGuardDevtools />);

    // Two instances share one ref-counted middleware → exactly one event per action.
    act(() => {
      uiBlockingStoreApi.getState().addBlocker("blocker-1", {
        scope: "x",
        reason: "r",
        priority: 1,
      });
    });
    expect(
      devtoolsStoreApi.getState().events.filter((event) => event.blockerId === "blocker-1")
    ).toHaveLength(1);

    // Unmounting one instance must not tear the middleware down for the other.
    first.unmount();
    act(() => {
      uiBlockingStoreApi.getState().addBlocker("blocker-2", {
        scope: "x",
        reason: "r",
        priority: 1,
      });
    });
    expect(
      devtoolsStoreApi.getState().events.some((event) => event.blockerId === "blocker-2")
    ).toBe(true);
  });
});

describe("ActionGuardDevtoolsContent", () => {
  beforeEach(() => {
    resetDevtoolsStore();
  });

  it("should render toggle button when panel is closed", () => {
    renderWithProviders(<ActionGuardDevtoolsContent position="right" />);

    expect(screen.getByTitle("Open Action Guard Devtools")).toBeInTheDocument();
  });
});
