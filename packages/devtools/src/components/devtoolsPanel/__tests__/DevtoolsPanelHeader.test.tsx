import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../test/utils";
import DevtoolsPanelHeader from "../DevtoolsPanelHeader";

describe("DevtoolsPanelHeader", () => {
  it("should render actions and respond to clicks", () => {
    const onTogglePause = vi.fn();
    const onClearEvents = vi.fn();
    const onToggleMinimized = vi.fn();
    const onClose = vi.fn();

    renderWithProviders(
      <DevtoolsPanelHeader
        eventsCount={3}
        isPaused={false}
        isMinimized={false}
        onTogglePause={onTogglePause}
        onClearEvents={onClearEvents}
        onToggleMinimized={onToggleMinimized}
        onClose={onClose}
      />
    );

    expect(screen.getByText("Action Guard")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    fireEvent.click(screen.getByTitle("Pause recording"));
    fireEvent.click(screen.getByTitle("Clear events"));
    fireEvent.click(screen.getByTitle("Minimize"));
    fireEvent.click(screen.getByTitle("Close"));

    expect(onTogglePause).toHaveBeenCalledTimes(1);
    expect(onClearEvents).toHaveBeenCalledTimes(1);
    expect(onToggleMinimized).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should show paused and minimized titles when active", () => {
    renderWithProviders(
      <DevtoolsPanelHeader
        eventsCount={0}
        isPaused={true}
        isMinimized={true}
        onTogglePause={vi.fn()}
        onClearEvents={vi.fn()}
        onToggleMinimized={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByTitle("Resume recording")).toBeInTheDocument();
    expect(screen.getByTitle("Maximize")).toBeInTheDocument();
  });
});
