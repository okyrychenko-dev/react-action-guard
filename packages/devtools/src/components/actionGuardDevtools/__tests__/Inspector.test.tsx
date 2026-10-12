import { UIBlockingProvider, uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ActionGuardDevtools from "../ActionGuardDevtools";
import InspectorTestApp from "./fixtures/InspectorTestApp";

describe("Inspector explanations", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(10_000);

    const { clearAllBlockers } = uiBlockingStoreApi.getState();

    clearAllBlockers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should keep explanations store-local, share observation state and survive partial and final detach", () => {
    render(
      <>
        <UIBlockingProvider>
          <InspectorTestApp name="alpha" inspection={{ scopes: ["checkout", "help"] }} />
        </UIBlockingProvider>
        <UIBlockingProvider>
          <InspectorTestApp name="beta" inspection={{ scopes: ["checkout"] }} />
        </UIBlockingProvider>
      </>
    );
    fireEvent.click(screen.getByRole("button", { name: "Add alpha" }));

    const firstAlpha = within(screen.getByRole("region", { name: "First alpha" }));
    const secondAlpha = within(screen.getByRole("region", { name: "Second alpha" }));
    const firstBeta = within(screen.getByRole("region", { name: "First beta" }));

    fireEvent.click(firstAlpha.getByRole("button", { name: "Active Blockers" }));
    fireEvent.click(firstBeta.getByRole("button", { name: "Active Blockers" }));
    expect(
      firstAlpha.getByRole("row", { name: "checkout Blocked alpha None" })
    ).toBeInTheDocument();
    expect(
      secondAlpha.getByRole("row", { name: "checkout Blocked alpha None" })
    ).toBeInTheDocument();
    expect(
      firstBeta.getByRole("row", { name: "checkout Unaffected None None" })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Toggle first alpha" }));
    act(() => {
      vi.advanceTimersByTime(2_000);
    });
    expect(
      secondAlpha.getByRole("row", { name: "checkout Unaffected None None" })
    ).toBeInTheDocument();
    fireEvent.click(secondAlpha.getByRole("button", { name: "Timeline" }));
    expect(secondAlpha.getByText("timeout")).toBeInTheDocument();
    expect(firstBeta.queryByText("alpha")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Toggle second alpha" }));
    fireEvent.click(screen.getByRole("button", { name: "Add alpha" }));
    fireEvent.click(screen.getByRole("button", { name: "Toggle second alpha" }));

    const reattached = within(screen.getByRole("region", { name: "Second alpha" }));

    expect(reattached.getByText("No events recorded yet.")).toBeInTheDocument();
    fireEvent.click(reattached.getByRole("button", { name: "Active Blockers" }));
    expect(
      reattached.getByRole("row", { name: "checkout Blocked alpha None" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear alpha" }));
    expect(
      reattached.getByRole("row", { name: "checkout Unaffected None None" })
    ).toBeInTheDocument();
  });

  it("should explain actual blocker identity, reason, priority and timestamp age without guessing provenance", () => {
    const { addBlocker } = uiBlockingStoreApi.getState();

    addBlocker("save-order", {
      scope: ["checkout", "navigation"],
      reason: "Saving order",
      priority: 30,
      timestamp: 8_000,
    });
    render(<ActionGuardDevtools defaultOpen />);
    fireEvent.click(screen.getByRole("button", { name: "Active Blockers" }));

    const blocker = within(screen.getByRole("article", { name: "Blocker save-order" }));

    expect(blocker.getByText("Scope: checkout, navigation")).toBeInTheDocument();
    expect(blocker.getByText("Reason: Saving order")).toBeInTheDocument();
    expect(blocker.getByText("Priority: 30")).toBeInTheDocument();
    expect(blocker.getByText("Age: 2000 ms")).toBeInTheDocument();
    expect(blocker.getByText("Source: unavailable")).toBeInTheDocument();
    expect(blocker.getByText("Affected actions: not declared")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(blocker.getByText("Age: 3000 ms")).toBeInTheDocument();
  });

  it("should visualize exact matching and declared actions while leaving dotted names and unrelated areas unaffected", () => {
    const { addBlocker, updateBlocker, removeBlocker } = uiBlockingStoreApi.getState();

    addBlocker("save", { scope: ["checkout", "navigation"], reason: "Saving" });
    render(
      <ActionGuardDevtools
        defaultOpen
        inspection={{
          scopes: ["checkout", "checkout.details", "help", "navigation"],
          actions: [
            { id: "submit", scope: "checkout" },
            { id: "leave", scope: ["navigation", "help"] },
            { id: "read-help", scope: "help" },
            { id: "no-scope", scope: [] },
          ],
        }}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Active Blockers" }));
    expect(screen.getByRole("img", { name: "Blockers and affected scopes" })).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Blockers and affected scopes" })
    ).toHaveAccessibleDescription("save blocks checkout. save blocks navigation");

    const protection = within(screen.getByRole("table", { name: "Scope protection" }));

    expect(
      protection.getByRole("row", { name: "checkout Blocked save submit" })
    ).toBeInTheDocument();
    expect(
      protection.getByRole("row", { name: "checkout.details Unaffected None None" })
    ).toBeInTheDocument();
    expect(
      protection.getByRole("row", { name: "help Unaffected None leave, read-help" })
    ).toBeInTheDocument();

    const blocker = within(screen.getByRole("article", { name: "Blocker save" }));

    expect(blocker.getByText("Affected actions: submit, leave")).toBeInTheDocument();

    act(() => updateBlocker("save", { scope: "global" }));
    expect(
      protection.getByRole("row", { name: "help Blocked save leave, read-help" })
    ).toBeInTheDocument();
    expect(blocker.getByText("Global effect: all non-empty scopes")).toBeInTheDocument();
    expect(blocker.getByText("Affected actions: submit, leave, read-help")).toBeInTheDocument();

    act(() => removeBlocker("save"));
    expect(
      protection.getByRole("row", { name: "checkout Unaffected None submit" })
    ).toBeInTheDocument();
    expect(screen.getByText("No active blockers")).toBeInTheDocument();
  });

  it("should distinguish missing reasons and unmatched declared actions while refreshing configuration and ages", () => {
    const { addBlocker, updateBlocker } = uiBlockingStoreApi.getState();

    render(
      <ActionGuardDevtools defaultOpen inspection={{ actions: [{ id: "help", scope: "help" }] }} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Active Blockers" }));
    act(() => {
      vi.advanceTimersByTime(5_000);
      addBlocker("future", { scope: "checkout", timestamp: 20_000 });
      addBlocker("current", { scope: "checkout", reason: "", priority: 40 });
    });

    const current = within(screen.getByRole("article", { name: "Blocker current" }));

    expect(current.getByText("Reason: not provided")).toBeInTheDocument();
    expect(current.getByText("Age: 0 ms")).toBeInTheDocument();
    expect(current.getByText("Affected actions: None")).toBeInTheDocument();
    expect(
      screen.getAllByRole("article").map((article) => article.getAttribute("aria-label"))
    ).toEqual(["Blocker current", "Blocker future"]);
    expect(
      within(screen.getByRole("article", { name: "Blocker future" })).getByText("Age: 0 ms")
    ).toBeInTheDocument();

    act(() => updateBlocker("current", { scope: "help", reason: "Help refresh", priority: 2 }));
    expect(current.getByText("Reason: Help refresh")).toBeInTheDocument();
    expect(current.getByText("Priority: 2")).toBeInTheDocument();
    expect(current.getByText("Affected actions: help")).toBeInTheDocument();
  });

  it("should update panel declarations without registering blockers or synthesizing events", () => {
    const { rerender } = render(
      <ActionGuardDevtools defaultOpen inspection={{ scopes: ["old-area"] }} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Active Blockers" }));
    expect(screen.getByRole("row", { name: "old-area Unaffected None None" })).toBeInTheDocument();

    rerender(
      <ActionGuardDevtools
        defaultOpen
        inspection={{ actions: [{ id: "help", scope: "new-area" }] }}
      />
    );

    expect(
      screen.queryByRole("row", { name: "old-area Unaffected None None" })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("row", { name: "new-area Unaffected None help" })).toBeInTheDocument();
    expect(screen.getByText("No active blockers")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Timeline" }));
    expect(screen.getByText("No events recorded yet.")).toBeInTheDocument();
  });

  it("should honor array global matching and empty scopes without guessing missing action mappings", () => {
    const { addBlocker } = uiBlockingStoreApi.getState();

    addBlocker("global-array", { scope: ["global", "checkout"] });
    addBlocker("empty", { scope: [] });
    render(<ActionGuardDevtools defaultOpen inspection={{ scopes: ["help"], actions: [] }} />);
    fireEvent.click(screen.getByRole("button", { name: "Active Blockers" }));
    expect(screen.getByRole("row", { name: "help Blocked global-array None" })).toBeInTheDocument();
    expect(
      within(screen.getByRole("article", { name: "Blocker empty" })).getByText(
        "Affected actions: None"
      )
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("article", { name: "Blocker global-array" })).getByText(
        "Reason: Unknown"
      )
    ).toBeInTheDocument();
  });
});
