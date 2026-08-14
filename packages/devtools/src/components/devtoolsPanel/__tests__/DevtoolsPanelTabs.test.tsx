import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../test/utils";
import styles from "../DevtoolsPanel.module.css";
import DevtoolsPanelTabs from "../DevtoolsPanelTabs";

describe("DevtoolsPanelTabs", () => {
  it("should invoke onSelectTab with clicked tab", () => {
    const onSelectTab = vi.fn();

    renderWithProviders(<DevtoolsPanelTabs activeTab="timeline" onSelectTab={onSelectTab} />);

    fireEvent.click(screen.getByText("Active Blockers"));

    expect(onSelectTab).toHaveBeenCalledTimes(1);
    expect(onSelectTab).toHaveBeenCalledWith("blockers");
  });

  it("should mark active tab", () => {
    renderWithProviders(<DevtoolsPanelTabs activeTab="blockers" onSelectTab={vi.fn()} />);

    const activeTab = screen.getByText("Active Blockers");
    expect(activeTab).toHaveClass(styles.tabActive);
  });
});
