import { act, fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_FILTER, DEFAULT_MAX_EVENTS, DEFAULT_TAB, devtoolsStoreApi } from "../../../store";
import { renderWithProviders } from "../../../test/utils";
import Timeline from "../Timeline";
import TimelineContent from "../TimelineContent";
import TimelineEmptyState from "../TimelineEmptyState";
import TimelineToolbar from "../TimelineToolbar";
import type { DevtoolsEvent } from "../../../types";

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

describe("Timeline", () => {
  beforeEach(() => {
    resetDevtoolsStore();
  });

  it("should render empty state when no events and no filters", () => {
    renderWithProviders(<Timeline />);

    expect(screen.getByText("No events recorded yet.")).toBeInTheDocument();
  });

  it("should update search filter", () => {
    devtoolsStoreApi.setState({ events: sampleEvents });

    renderWithProviders(<Timeline />);

    const input = screen.getByPlaceholderText("Search by ID or reason...");
    fireEvent.change(input, { target: { value: "blocker-2" } });

    expect(devtoolsStoreApi.getState().filter.search).toBe("blocker-2");
  });

  it("should show event details when selecting an event", () => {
    devtoolsStoreApi.setState({ events: sampleEvents });

    renderWithProviders(<Timeline />);

    fireEvent.click(screen.getByText("blocker-1"));

    expect(screen.getByText("Blocker ID")).toBeInTheDocument();
    expect(screen.getByTitle("Close details")).toBeInTheDocument();
  });

  it("should close event details when clicking close button", () => {
    devtoolsStoreApi.setState({ events: sampleEvents, selectedEventId: "event-1" });

    renderWithProviders(<Timeline />);

    // Details should be visible
    expect(screen.getByText("Blocker ID")).toBeInTheDocument();

    // Click close button
    fireEvent.click(screen.getByTitle("Close details"));

    // Details should be hidden
    expect(screen.queryByText("Blocker ID")).not.toBeInTheDocument();
    expect(devtoolsStoreApi.getState().selectedEventId).toBeNull();
  });

  it("should clear selection when selected event is removed from buffer", () => {
    devtoolsStoreApi.setState({ events: sampleEvents, selectedEventId: "event-1" });

    const { rerender } = renderWithProviders(<Timeline />);

    // Event is selected
    expect(devtoolsStoreApi.getState().selectedEventId).toBe("event-1");

    // Remove the selected event from the store (simulating circular buffer eviction)
    act(() => {
      devtoolsStoreApi.setState({
        events: sampleEvents.filter((e) => e.id !== "event-1"),
      });

      // Re-render to trigger the effect
      rerender(<Timeline />);
    });

    // Selection should be cleared
    expect(devtoolsStoreApi.getState().selectedEventId).toBeNull();
  });

  it("should clear selection when selected event is filtered out", () => {
    devtoolsStoreApi.setState({ events: sampleEvents, selectedEventId: "event-1" });

    renderWithProviders(<Timeline />);

    fireEvent.change(screen.getByPlaceholderText("Search by ID or reason..."), {
      target: { value: "blocker-2" },
    });

    expect(devtoolsStoreApi.getState().selectedEventId).toBeNull();
    expect(screen.queryByText("Blocker ID")).not.toBeInTheDocument();
  });
});

describe("TimelineContent", () => {
  it("should render empty content message when no events", () => {
    renderWithProviders(
      <TimelineContent events={[]} selectedEventId={null} onSelectEvent={vi.fn()} />
    );

    expect(screen.getByText("No matching events")).toBeInTheDocument();
  });

  it("should call onSelectEvent on item click", () => {
    const onSelectEvent = vi.fn();

    renderWithProviders(
      <TimelineContent events={sampleEvents} selectedEventId={null} onSelectEvent={onSelectEvent} />
    );

    fireEvent.click(screen.getByText("blocker-1"));

    expect(onSelectEvent).toHaveBeenCalledWith("event-1");
  });
});

describe("TimelineToolbar", () => {
  it("should call onSearchChange", () => {
    const onSearchChange = vi.fn();

    renderWithProviders(
      <TimelineToolbar
        search=""
        hasEvents
        copyStatus="idle"
        onSearchChange={onSearchChange}
        onCopy={vi.fn()}
        onExport={vi.fn()}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Search by ID or reason..."), {
      target: { value: "test" },
    });

    expect(onSearchChange).toHaveBeenCalledTimes(1);
  });

  it("should call copy and export handlers", () => {
    const onCopy = vi.fn();
    const onExport = vi.fn();

    renderWithProviders(
      <TimelineToolbar
        search=""
        hasEvents
        copyStatus="idle"
        onSearchChange={vi.fn()}
        onCopy={onCopy}
        onExport={onExport}
      />
    );

    fireEvent.click(screen.getByTitle("Copy events as JSON"));
    fireEvent.click(screen.getByTitle("Download events as JSON"));

    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it("should disable copy and export when there are no events", () => {
    renderWithProviders(
      <TimelineToolbar
        search=""
        hasEvents={false}
        copyStatus="idle"
        onSearchChange={vi.fn()}
        onCopy={vi.fn()}
        onExport={vi.fn()}
      />
    );

    expect(screen.getByTitle("Copy events as JSON")).toBeDisabled();
    expect(screen.getByTitle("Download events as JSON")).toBeDisabled();
  });

  it("should surface the copy status to assistive tech", () => {
    const { rerender } = renderWithProviders(
      <TimelineToolbar
        search=""
        hasEvents
        copyStatus="copied"
        onSearchChange={vi.fn()}
        onCopy={vi.fn()}
        onExport={vi.fn()}
      />
    );

    expect(screen.getByRole("status")).toHaveTextContent("Copied");

    rerender(
      <TimelineToolbar
        search=""
        hasEvents
        copyStatus="failed"
        onSearchChange={vi.fn()}
        onCopy={vi.fn()}
        onExport={vi.fn()}
      />
    );

    expect(screen.getByRole("status")).toHaveTextContent("Copy failed");
  });
});

describe("TimelineEmptyState", () => {
  it("should render empty state copy", () => {
    renderWithProviders(<TimelineEmptyState />);

    expect(screen.getByText("No events recorded yet.")).toBeInTheDocument();
    expect(
      screen.getByText("Events will appear here as blockers are added/removed.")
    ).toBeInTheDocument();
  });
});
