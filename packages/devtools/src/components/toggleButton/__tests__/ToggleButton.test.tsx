import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_FILTER, DEFAULT_MAX_EVENTS, DEFAULT_TAB, devtoolsStoreApi } from "../../../store";
import { renderWithProviders } from "../../../test/utils";
import ToggleButton from "../ToggleButton";
import ToggleButtonBadge from "../ToggleButtonBadge";

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

describe("ToggleButtonBadge", () => {
  it("should render when count is positive", () => {
    renderWithProviders(<ToggleButtonBadge count={2} isPaused={false} />);

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("should not render when count is zero", () => {
    renderWithProviders(<ToggleButtonBadge count={0} isPaused={false} />);

    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});

describe("ToggleButton", () => {
  beforeEach(() => {
    resetDevtoolsStore();
    uiBlockingStoreApi.getState().clearAllBlockers();
  });

  it("should render button when panel is closed", () => {
    renderWithProviders(<ToggleButton position="right" />);

    expect(screen.getByTitle("Open Action Guard Devtools")).toBeInTheDocument();
  });

  it("should hide button when panel is open", () => {
    devtoolsStoreApi.setState({ isOpen: true });

    renderWithProviders(<ToggleButton position="right" />);

    expect(screen.queryByTitle("Open Action Guard Devtools")).not.toBeInTheDocument();
  });

  it("should show active blockers count", () => {
    uiBlockingStoreApi.getState().addBlocker("blocker-1");
    uiBlockingStoreApi.getState().addBlocker("blocker-2");

    renderWithProviders(<ToggleButton position="right" />);

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("should toggle open state on click", () => {
    renderWithProviders(<ToggleButton position="right" />);

    fireEvent.click(screen.getByTitle("Open Action Guard Devtools"));

    expect(devtoolsStoreApi.getState().isOpen).toBe(true);
  });
});
