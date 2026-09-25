import { DEVTOOLS_MIDDLEWARE_NAME, createDevtoolsMiddleware } from "@devtools/middleware";
import {
  DEFAULT_FILTER,
  DEFAULT_MAX_EVENTS,
  DEFAULT_TAB,
  DEVTOOLS_STORAGE_KEY,
  devtoolsStoreApi,
} from "@devtools/store";
import { renderWithProviders } from "@devtools/test/utils";
import {
  UIBlockingProvider,
  uiBlockingStoreApi,
  useOptionalUIBlockingContext,
} from "@okyrychenko-dev/react-action-guard";
import { assertDefined, isDefined, isUndefined } from "@okyrychenko-dev/type-utils";
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { ReactElement, StrictMode, useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ActionGuardDevtools from "../ActionGuardDevtools";
import ActionGuardDevtoolsContent from "../ActionGuardDevtoolsContent";
import { ManualCustomObservationContent } from "./fixtures";
import type { DevtoolsEvent } from "@devtools/types";

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

interface ObservationSessionHarnessProps {
  addLabel: string;
  blockerId: string;
  observerNames?: ReadonlyArray<string>;
  toggleLabel?: string;
  useGlobalStore?: boolean;
}

function ObservationSessionHarness(props: ObservationSessionHarnessProps): ReactElement {
  const { addLabel, blockerId, observerNames, toggleLabel, useGlobalStore = false } = props;
  const contextStore = useOptionalUIBlockingContext();
  const [isObserving, setIsObserving] = useState(true);
  const store = useGlobalStore ? uiBlockingStoreApi : contextStore;

  assertDefined(store, "Custom observation-session harness requires UIBlockingProvider");

  const addBlocker = (): void => {
    const { addBlocker: addStoreBlocker } = store.getState();

    addStoreBlocker(blockerId, {
      scope: blockerId,
      reason: `${blockerId} reason`,
      priority: 1,
    });
  };

  const toggleObservation = (): void => {
    setIsObserving((current) => !current);
  };

  const observedStore = useGlobalStore ? undefined : store;

  return (
    <>
      <button onClick={addBlocker}>{addLabel}</button>
      {isDefined(toggleLabel) && <button onClick={toggleObservation}>{toggleLabel}</button>}
      {isObserving && isUndefined(observerNames) && (
        <ActionGuardDevtools store={observedStore} defaultOpen={true} />
      )}
      {isObserving &&
        observerNames?.map((observerName) => (
          <section key={observerName} aria-label={observerName}>
            <ActionGuardDevtools store={observedStore} defaultOpen={true} />
          </section>
        ))}
    </>
  );
}

describe("ActionGuardDevtools", () => {
  beforeEach(() => {
    resetDevtoolsStore();
    const { clearAllBlockers } = uiBlockingStoreApi.getState();

    clearAllBlockers();
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

    const { maxEvents } = devtoolsStoreApi.getState();

    expect(screen.getByText("Action Guard")).toBeInTheDocument();
    expect(maxEvents).toBe(300);
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

    const { events: recordedEvents } = devtoolsStoreApi.getState();

    expect(recordedEvents).toHaveLength(1);

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

    const { events: recordedEvents } = devtoolsStoreApi.getState();

    expect(recordedEvents).toHaveLength(1);

    selectElement.remove();
  });

  it("should record each event once and keep middleware alive across instances", () => {
    const first = renderWithProviders(<ActionGuardDevtools />);

    renderWithProviders(<ActionGuardDevtools />);
    const { addBlocker } = uiBlockingStoreApi.getState();

    // Two instances share one ref-counted middleware → exactly one event per action.
    act(() => {
      addBlocker("blocker-1", {
        scope: "x",
        reason: "r",
        priority: 1,
      });
    });

    const { events: firstEvents } = devtoolsStoreApi.getState();

    expect(firstEvents.filter((event) => event.blockerId === "blocker-1")).toHaveLength(1);

    // Unmounting one instance must not tear the middleware down for the other.
    first.unmount();
    act(() => {
      addBlocker("blocker-2", {
        scope: "x",
        reason: "r",
        priority: 1,
      });
    });

    const { events: secondEvents } = devtoolsStoreApi.getState();

    expect(secondEvents.some((event) => event.blockerId === "blocker-2")).toBe(true);
  });

  it("should record each event once in React Strict Mode", () => {
    renderWithProviders(
      <StrictMode>
        <ActionGuardDevtools />
      </StrictMode>
    );

    const { addBlocker } = uiBlockingStoreApi.getState();

    act(() => {
      addBlocker("strict-mode-blocker");
    });

    const { events } = devtoolsStoreApi.getState();

    expect(events.filter((event) => event.blockerId === "strict-mode-blocker")).toHaveLength(1);
  });

  it("should preserve timeout and remove as separate observed events", () => {
    vi.useFakeTimers();

    try {
      renderWithProviders(<ActionGuardDevtools />);
      const { addBlocker } = uiBlockingStoreApi.getState();

      act(() => {
        addBlocker("timeout-observation-blocker", {
          timeout: 1_000,
        });
      });

      act(() => {
        vi.advanceTimersByTime(1_000);
      });

      const { events } = devtoolsStoreApi.getState();
      const observedActions = events
        .filter((event) => event.blockerId === "timeout-observation-blocker")
        .map((event) => event.action);

      expect(observedActions).toEqual(["remove", "timeout", "add"]);
    } finally {
      vi.useRealTimers();
    }
  });

  it("should show pre-existing blockers without synthesizing historical events", () => {
    const { addBlocker } = uiBlockingStoreApi.getState();

    act(() => {
      addBlocker("pre-existing-blocker");
    });

    renderWithProviders(<ActionGuardDevtools defaultOpen={true} />);

    const { events } = devtoolsStoreApi.getState();

    expect(events).toHaveLength(0);
    expect(screen.getByText("No events recorded yet.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Active Blockers" }));

    expect(screen.getByText("pre-existing-blocker")).toBeInTheDocument();
    expect(events).toHaveLength(0);
  });

  it("should preserve caller-owned manual middleware during automatic observation", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const manualMiddleware = createDevtoolsMiddleware();
    const { addBlocker, registerMiddleware, unregisterMiddleware } = uiBlockingStoreApi.getState();

    registerMiddleware(DEVTOOLS_MIDDLEWARE_NAME, manualMiddleware);

    const devtools = renderWithProviders(<ActionGuardDevtools />);

    act(() => {
      addBlocker("manual-and-automatic-blocker");
    });

    const { events: eventsDuringAutomaticObservation } = devtoolsStoreApi.getState();

    expect(
      eventsDuringAutomaticObservation.filter(
        (event) => event.blockerId === "manual-and-automatic-blocker"
      )
    ).toHaveLength(1);
    expect(warn).toHaveBeenCalledWith(
      "[ActionGuardDevtools] Automatic observation found an existing manual Devtools " +
        "middleware registration. The manual registration remains authoritative."
    );

    devtools.unmount();

    act(() => {
      addBlocker("manual-after-automatic-blocker");
    });

    const { events: eventsAfterAutomaticObservation } = devtoolsStoreApi.getState();

    expect(
      eventsAfterAutomaticObservation.some(
        (event) => event.blockerId === "manual-after-automatic-blocker"
      )
    ).toBe(true);

    unregisterMiddleware(DEVTOOLS_MIDDLEWARE_NAME);
  });

  it("should preserve caller middleware registered during automatic observation", () => {
    const devtools = renderWithProviders(<ActionGuardDevtools />);
    const replacementMiddleware = createDevtoolsMiddleware();
    const { addBlocker, registerMiddleware } = uiBlockingStoreApi.getState();

    act(() => {
      addBlocker("automatically-observed-blocker");
    });
    const { events: automaticallyObservedEvents } = devtoolsStoreApi.getState();

    expect(
      automaticallyObservedEvents.some(
        (event) => event.blockerId === "automatically-observed-blocker"
      )
    ).toBe(true);

    registerMiddleware(DEVTOOLS_MIDDLEWARE_NAME, replacementMiddleware);
    act(() => {
      addBlocker("manual-during-automatic-blocker");
    });
    const { events: eventsDuringManualObservation } = devtoolsStoreApi.getState();

    expect(
      eventsDuringManualObservation.filter(
        (event) => event.blockerId === "manual-during-automatic-blocker"
      )
    ).toHaveLength(1);

    devtools.unmount();

    const { addBlocker: addBlockerAfterUnmount, unregisterMiddleware } =
      uiBlockingStoreApi.getState();

    act(() => {
      addBlockerAfterUnmount("replacement-after-automatic-blocker");
    });

    const { events } = devtoolsStoreApi.getState();

    expect(events.some((event) => event.blockerId === "replacement-after-automatic-blocker")).toBe(
      true
    );

    unregisterMiddleware(DEVTOOLS_MIDDLEWARE_NAME);
  });

  it("should record custom-store events when caller-owned middleware is already registered", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const reservedMiddleware = vi.fn();

    renderWithProviders(
      <UIBlockingProvider>
        <ManualCustomObservationContent onReservedMiddlewareCall={reservedMiddleware} />
      </UIBlockingProvider>
    );

    await screen.findByText("Action Guard");
    fireEvent.click(screen.getByRole("button", { name: "Add manually observed custom blocker" }));

    await waitFor(() => {
      expect(screen.getByText("manual-custom-blocker")).toBeInTheDocument();
    });
    expect(reservedMiddleware).toHaveBeenCalledOnce();
    expect(warn).toHaveBeenCalledWith(
      "[ActionGuardDevtools] Automatic observation preserved the existing manual " +
        "Devtools middleware and added an observation lease for the custom store."
    );

    fireEvent.click(screen.getByRole("button", { name: "Toggle manual custom observation" }));
    const { clearEvents } = devtoolsStoreApi.getState();

    clearEvents();
    fireEvent.click(screen.getByRole("button", { name: "Add manually observed custom blocker" }));

    const { events } = devtoolsStoreApi.getState();

    expect(events.some((event) => event.blockerId === "manual-custom-blocker")).toBe(true);
  });

  it("should keep observing a custom store after caller-owned middleware is registered", async () => {
    renderWithProviders(
      <UIBlockingProvider>
        <ManualCustomObservationContent
          onReservedMiddlewareCall={vi.fn()}
          registerManualBeforeObservation={false}
        />
      </UIBlockingProvider>
    );

    await screen.findByText("Action Guard");
    fireEvent.click(screen.getByRole("button", { name: "Register manual custom middleware" }));
    fireEvent.click(screen.getByRole("button", { name: "Add manually observed custom blocker" }));

    await waitFor(() => {
      expect(screen.getByText("manual-custom-blocker")).toBeInTheDocument();
    });
  });

  it("should isolate observation sessions for different custom stores", async () => {
    renderWithProviders(
      <>
        <UIBlockingProvider>
          <ObservationSessionHarness
            addLabel="Add first blocker"
            blockerId="first-blocker"
            observerNames={["first devtools"]}
          />
        </UIBlockingProvider>
        <UIBlockingProvider>
          <ObservationSessionHarness
            addLabel="Add second blocker"
            blockerId="second-blocker"
            observerNames={["second devtools"]}
          />
        </UIBlockingProvider>
      </>
    );

    fireEvent.click(screen.getByRole("button", { name: "Add first blocker" }));
    fireEvent.click(screen.getByRole("button", { name: "Add second blocker" }));

    const firstDevtools = within(screen.getByRole("region", { name: "first devtools" }));
    const secondDevtools = within(screen.getByRole("region", { name: "second devtools" }));

    await waitFor(() => {
      expect(firstDevtools.getByText("first-blocker")).toBeInTheDocument();
      expect(secondDevtools.getByText("second-blocker")).toBeInTheDocument();
    });

    expect(firstDevtools.queryByText("second-blocker")).not.toBeInTheDocument();
    expect(secondDevtools.queryByText("first-blocker")).not.toBeInTheDocument();

    fireEvent.click(firstDevtools.getByTitle("Pause recording"));

    expect(firstDevtools.getByTitle("Resume recording")).toBeInTheDocument();
    expect(secondDevtools.getByTitle("Pause recording")).toBeInTheDocument();
  });

  it("should share an observation session between observers of the same store", async () => {
    renderWithProviders(
      <UIBlockingProvider>
        <ObservationSessionHarness
          addLabel="Add shared blocker"
          blockerId="shared-blocker"
          observerNames={["first observer", "second observer"]}
        />
      </UIBlockingProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Add shared blocker" }));

    const firstObserver = within(screen.getByRole("region", { name: "first observer" }));
    const secondObserver = within(screen.getByRole("region", { name: "second observer" }));

    await waitFor(() => {
      expect(firstObserver.getByText("shared-blocker")).toBeInTheDocument();
      expect(secondObserver.getByText("shared-blocker")).toBeInTheDocument();
    });
  });

  it("should discard a session after its final observer detaches", async () => {
    renderWithProviders(
      <UIBlockingProvider>
        <ObservationSessionHarness
          addLabel="Add lifecycle blocker"
          blockerId="previous-session-blocker"
          toggleLabel="Toggle observation"
        />
      </UIBlockingProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Add lifecycle blocker" }));

    await waitFor(() => {
      expect(screen.getByText("previous-session-blocker")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Toggle observation" }));
    fireEvent.click(screen.getByRole("button", { name: "Toggle observation" }));

    await waitFor(() => {
      expect(screen.getByText("No events recorded yet.")).toBeInTheDocument();
    });
    expect(screen.queryByText("previous-session-blocker")).not.toBeInTheDocument();
  });

  it("should discard the global session after its final observer detaches", async () => {
    renderWithProviders(
      <ObservationSessionHarness
        addLabel="Add global lifecycle blocker"
        blockerId="global-session-blocker"
        toggleLabel="Toggle global observation"
        useGlobalStore={true}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add global lifecycle blocker" }));

    await waitFor(() => {
      expect(screen.getByText("global-session-blocker")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Toggle global observation" }));
    fireEvent.click(screen.getByRole("button", { name: "Toggle global observation" }));

    await waitFor(() => {
      expect(screen.getByText("No events recorded yet.")).toBeInTheDocument();
    });
    expect(screen.queryByText("global-session-blocker")).not.toBeInTheDocument();
  });

  it("should preserve persisted preferences after the final global observer detaches", () => {
    renderWithProviders(
      <ObservationSessionHarness
        addLabel="Add unused blocker"
        blockerId="unused-blocker"
        toggleLabel="Toggle persisted observation"
        useGlobalStore={true}
      />
    );
    const { setActiveTab, setFilter, toggleMinimized } = devtoolsStoreApi.getState();

    act(() => {
      toggleMinimized();
      setActiveTab("stats");
      setFilter({ search: "persisted search" });
    });

    fireEvent.click(screen.getByRole("button", { name: "Toggle persisted observation" }));

    const stateAfterDetach = devtoolsStoreApi.getState();

    expect(stateAfterDetach.isMinimized).toBe(true);
    expect(stateAfterDetach.activeTab).toBe("stats");
    expect(stateAfterDetach.filter.search).toBe("persisted search");
    expect(window.localStorage.getItem(DEVTOOLS_STORAGE_KEY)).toContain('"isMinimized":true');
    expect(window.localStorage.getItem(DEVTOOLS_STORAGE_KEY)).toContain('"activeTab":"stats"');
    expect(window.localStorage.getItem(DEVTOOLS_STORAGE_KEY)).toContain(
      '"search":"persisted search"'
    );
  });

  it("should persist preferences when the global store is passed explicitly", () => {
    renderWithProviders(<ActionGuardDevtools store={uiBlockingStoreApi} defaultOpen={true} />);

    fireEvent.click(screen.getByRole("button", { name: "Stats" }));

    expect(window.localStorage.getItem(DEVTOOLS_STORAGE_KEY)).toContain('"activeTab":"stats"');
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
