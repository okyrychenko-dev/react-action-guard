import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../test/utils";
import ActiveBlockerItem from "../ActiveBlockerItem";
import ActiveBlockers from "../ActiveBlockers";
import ActiveBlockersEmptyState from "../ActiveBlockersEmptyState";
import ActiveBlockersList from "../ActiveBlockersList";
import type { StoredBlocker } from "@okyrychenko-dev/react-action-guard";

describe("ActiveBlockers", () => {
  beforeEach(() => {
    uiBlockingStoreApi.getState().clearAllBlockers();
  });

  it("should render empty state when no blockers", () => {
    renderWithProviders(<ActiveBlockers />);

    expect(screen.getByText("No active blockers")).toBeInTheDocument();
    expect(screen.getByText("The UI is currently unblocked.")).toBeInTheDocument();
  });

  it("should render blockers list when blockers exist", () => {
    uiBlockingStoreApi.getState().addBlocker("blocker-1", {
      scope: "test",
      reason: "Loading data",
      priority: 20,
    });

    renderWithProviders(<ActiveBlockers />);

    expect(screen.getByText("blocker-1")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("should flag a blocker as stuck once it crosses the threshold", () => {
    uiBlockingStoreApi.getState().addBlocker("blocker-1", {
      scope: "test",
      reason: "Loading data",
      priority: 20,
    });

    // Threshold of 0 means any active blocker is immediately considered stuck.
    renderWithProviders(<ActiveBlockers stuckThresholdMs={0} />);

    expect(screen.getByText("Stuck")).toBeInTheDocument();
    expect(screen.queryByText("Active")).not.toBeInTheDocument();
  });
});

describe("ActiveBlockerItem", () => {
  it("should render blocker details", () => {
    const now = 10_000;
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(now);

    const blocker: StoredBlocker = {
      scope: ["scope-a", "scope-b"],
      reason: "Saving",
      priority: 42,
      timestamp: now - 2_000,
    };

    renderWithProviders(<ActiveBlockerItem id="blocker-1" blocker={blocker} isStuck={false} />);

    expect(screen.getByText("blocker-1")).toBeInTheDocument();
    expect(screen.getByText("Scope: scope-a, scope-b")).toBeInTheDocument();
    expect(screen.getByText("Priority: 42")).toBeInTheDocument();
    expect(screen.getByText("Reason: Saving")).toBeInTheDocument();
    expect(screen.getByText("Started: 2s ago")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();

    nowSpy.mockRestore();
  });

  it("should render a Stuck badge instead of Active when stuck", () => {
    const blocker: StoredBlocker = {
      scope: "test",
      reason: "Saving",
      priority: 1,
      timestamp: 0,
    };

    renderWithProviders(<ActiveBlockerItem id="blocker-stuck" blocker={blocker} isStuck />);

    expect(screen.getByText("Stuck")).toBeInTheDocument();
    expect(screen.queryByText("Active")).not.toBeInTheDocument();
  });

  it("should format timestamp in minutes", () => {
    const now = 1_000_000;
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(now);

    const blocker: StoredBlocker = {
      scope: "test",
      reason: "Test",
      priority: 1,
      timestamp: now - 120_000, // 2 minutes ago
    };

    renderWithProviders(<ActiveBlockerItem id="blocker-min" blocker={blocker} isStuck={false} />);

    expect(screen.getByText("Started: 2m ago")).toBeInTheDocument();

    nowSpy.mockRestore();
  });

  it("should format timestamp in hours", () => {
    const now = 10_000_000;
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(now);

    const blocker: StoredBlocker = {
      scope: "test",
      reason: "Test",
      priority: 1,
      timestamp: now - 7_200_000, // 2 hours ago
    };

    renderWithProviders(<ActiveBlockerItem id="blocker-hr" blocker={blocker} isStuck={false} />);

    expect(screen.getByText("Started: 2h ago")).toBeInTheDocument();

    nowSpy.mockRestore();
  });
});

describe("ActiveBlockersList", () => {
  it("should render each blocker item", () => {
    const blockers: Array<[string, StoredBlocker]> = [
      ["blocker-1", { scope: "a", reason: "Reason A", priority: 1, timestamp: 1_000 }],
      ["blocker-2", { scope: "b", reason: "Reason B", priority: 2, timestamp: 2_000 }],
    ];

    renderWithProviders(
      <ActiveBlockersList blockers={blockers} now={3_000} stuckThresholdMs={10_000} />
    );

    expect(screen.getByText("blocker-1")).toBeInTheDocument();
    expect(screen.getByText("blocker-2")).toBeInTheDocument();
  });

  it("should mark only blockers older than the threshold as stuck", () => {
    const now = 20_000;
    const blockers: Array<[string, StoredBlocker]> = [
      ["fresh", { scope: "a", reason: "Fresh", priority: 2, timestamp: now - 1_000 }],
      ["stuck", { scope: "b", reason: "Stuck", priority: 1, timestamp: now - 15_000 }],
    ];

    renderWithProviders(
      <ActiveBlockersList blockers={blockers} now={now} stuckThresholdMs={10_000} />
    );

    expect(screen.getByText("Stuck")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });
});

describe("ActiveBlockersEmptyState", () => {
  it("should render empty state copy", () => {
    renderWithProviders(<ActiveBlockersEmptyState />);

    expect(screen.getByText("No active blockers")).toBeInTheDocument();
    expect(screen.getByText("The UI is currently unblocked.")).toBeInTheDocument();
  });
});
