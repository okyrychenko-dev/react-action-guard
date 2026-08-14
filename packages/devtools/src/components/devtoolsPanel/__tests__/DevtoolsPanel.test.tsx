import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_FILTER, DEFAULT_MAX_EVENTS, DEFAULT_TAB, devtoolsStoreApi } from "../../../store";
import { renderWithProviders } from "../../../test/utils";
import DevtoolsPanel from "../DevtoolsPanel";
import DevtoolsPanelContent from "../DevtoolsPanelContent";

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

describe("DevtoolsPanel", () => {
  beforeEach(() => {
    resetDevtoolsStore();
  });

  it("should not render when closed", () => {
    renderWithProviders(<DevtoolsPanel position="right" />);

    expect(screen.queryByText("Action Guard")).not.toBeInTheDocument();
  });

  it("should render header when open", () => {
    devtoolsStoreApi.setState({ isOpen: true });

    renderWithProviders(<DevtoolsPanel position="right" />);

    expect(screen.getByText("Action Guard")).toBeInTheDocument();
    expect(screen.getByTitle("Close")).toBeInTheDocument();
  });

  it("should hide tabs and content when minimized", () => {
    devtoolsStoreApi.setState({ isOpen: true, isMinimized: true });

    renderWithProviders(<DevtoolsPanel position="right" />);

    expect(screen.queryByText("Timeline")).not.toBeInTheDocument();
    expect(screen.queryByText("Active Blockers")).not.toBeInTheDocument();
  });
});

describe("DevtoolsPanelContent", () => {
  beforeEach(() => {
    uiBlockingStoreApi.getState().clearAllBlockers();
  });

  it("should render timeline content when activeTab is timeline", () => {
    renderWithProviders(<DevtoolsPanelContent activeTab="timeline" />);

    expect(screen.getByText("No events recorded yet.")).toBeInTheDocument();
  });

  it("should render active blockers when activeTab is blockers", () => {
    renderWithProviders(<DevtoolsPanelContent activeTab="blockers" />);

    expect(screen.getByText("No active blockers")).toBeInTheDocument();
  });
});
