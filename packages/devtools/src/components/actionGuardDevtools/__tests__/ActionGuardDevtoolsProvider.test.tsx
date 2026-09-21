import { DEVTOOLS_STORAGE_KEY, devtoolsStoreApi } from "@devtools/store";
import { renderWithProviders } from "@devtools/test/utils";
import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CustomObservationTestApp,
  ProductionObservationTestApp,
  SharedConfigurationTestApp,
  SwitchingObservationTestApp,
} from "./fixtures";

describe("ActionGuardDevtoolsProvider", () => {
  beforeEach(() => {
    const { clearEvents, isMinimized, resetFilter, setActiveTab, toggleMinimized } =
      devtoolsStoreApi.getState();

    clearEvents();
    setActiveTab("timeline");
    resetFilter();
    if (isMinimized) {
      toggleMinimized();
    }
    window.localStorage.clear();
    const { clearAllBlockers } = uiBlockingStoreApi.getState();

    clearAllBlockers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("should bind public store consumers to a custom observation session", () => {
    renderWithProviders(<CustomObservationTestApp />);

    fireEvent.click(screen.getByRole("button", { name: "Add provider blocker" }));

    expect(screen.getByText("Observed events: provider-blocker-1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pause consumer" }));
    fireEvent.click(screen.getByRole("button", { name: "Add provider blocker" }));

    expect(screen.getByText("Observed events: provider-blocker-1")).toBeInTheDocument();
    expect(screen.queryByText(/provider-blocker-2/)).not.toBeInTheDocument();
  });

  it("should observe blockers activated by descendant passive effects", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);

    renderWithProviders(<CustomObservationTestApp hasInitialBlocker={true} />);

    expect(
      screen.getByText(
        "Observed events: initial-scheduled-blocker, initial-conditional-blocker, " +
          "initial-action-blocker"
      )
    ).toBeInTheDocument();

    vi.setSystemTime(1_500);
    fireEvent.click(screen.getByRole("button", { name: "Remove initial blocker" }));

    expect(
      screen.getByText("Observed event details: remove:500, add:none, add:none, add:none")
    ).toBeInTheDocument();
  });

  it("should keep the first panel configuration and warn about later conflicts", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    renderWithProviders(<SharedConfigurationTestApp />);

    expect(screen.getByText("Configured maximum: 1")).toBeInTheDocument();
    expect(screen.getByText("Configured open state: open")).toBeInTheDocument();
    expect(warn).toHaveBeenCalledWith(
      "[ActionGuardDevtools] Ignored conflicting observation-session configuration. " +
        "The first panel for a blocking store controls defaultOpen and maxEvents."
    );
  });

  it("should persist custom-session preferences for future observation sessions", () => {
    const firstObservation = renderWithProviders(<CustomObservationTestApp />);

    fireEvent.click(screen.getByRole("button", { name: "Set stats preference" }));
    fireEvent.click(screen.getByRole("button", { name: "Set search preference" }));
    fireEvent.click(screen.getByRole("button", { name: "Toggle minimized preference" }));

    const persistedPreferences = window.localStorage.getItem(DEVTOOLS_STORAGE_KEY);

    expect(persistedPreferences).toContain('"activeTab":"stats"');
    expect(persistedPreferences).toContain('"search":"provider-blocker"');
    expect(persistedPreferences).toContain('"isMinimized":true');

    firstObservation.unmount();
    renderWithProviders(<CustomObservationTestApp />);

    expect(screen.getByText("Active preference: stats")).toBeInTheDocument();
    expect(screen.getByText("Search preference: provider-blocker")).toBeInTheDocument();
    expect(screen.getByText("Minimized preference: minimized")).toBeInTheDocument();
    expect(screen.getByText("Observed events:")).toBeInTheDocument();
    expect(screen.getByText("Configured open state: closed")).toBeInTheDocument();
    expect(screen.getByText("Configured maximum: 200")).toBeInTheDocument();
  });

  it("should isolate runtime viewing state between custom stores", () => {
    renderWithProviders(
      <>
        <CustomObservationTestApp
          label="first custom observation"
          defaultOpen={true}
          maxEvents={1}
        />
        <CustomObservationTestApp
          label="second custom observation"
          defaultOpen={false}
          maxEvents={2}
        />
      </>
    );

    const first = within(screen.getByRole("region", { name: "first custom observation" }));
    const second = within(screen.getByRole("region", { name: "second custom observation" }));

    fireEvent.click(first.getByRole("button", { name: "Add provider blocker" }));
    fireEvent.click(second.getByRole("button", { name: "Add provider blocker" }));
    fireEvent.click(first.getByRole("button", { name: "Set search preference" }));
    fireEvent.click(first.getByRole("button", { name: "Select first event" }));
    fireEvent.click(first.getByRole("button", { name: "Pause consumer" }));

    expect(first.getByText("Configured open state: open")).toBeInTheDocument();
    expect(first.getByText("Configured maximum: 1")).toBeInTheDocument();
    expect(first.getByText("Search preference: provider-blocker")).toBeInTheDocument();
    expect(first.getByText("Selected event: selected")).toBeInTheDocument();
    expect(first.getByRole("button", { name: "Resume consumer" })).toBeInTheDocument();

    expect(second.getByText("Configured open state: closed")).toBeInTheDocument();
    expect(second.getByText("Configured maximum: 2")).toBeInTheDocument();
    expect(second.getByText("Search preference:")).toBeInTheDocument();
    expect(second.getByText("Selected event: none")).toBeInTheDocument();
    expect(second.getByRole("button", { name: "Pause consumer" })).toBeInTheDocument();
  });

  it("should release the old session when the observed store changes", () => {
    renderWithProviders(<SwitchingObservationTestApp />);

    fireEvent.click(screen.getByRole("button", { name: "Add first-store blocker" }));
    expect(screen.getByText("Observed events: first-store-blocker")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Switch observed store" }));
    expect(screen.getByText("Observed events:")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add first-store blocker" }));
    expect(screen.getByText("Observed events:")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add second-store blocker" }));
    expect(screen.getByText("Observed events: second-store-blocker")).toBeInTheDocument();
    expect(screen.queryByText(/Observed events:.*first-store-blocker/)).not.toBeInTheDocument();
  });

  it("should initialize each observed store from its current defaultOpen prop", async () => {
    renderWithProviders(<SwitchingObservationTestApp />);

    await waitFor(() => {
      expect(screen.getByText("Configured open state: open")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Switch observed store" }));

    await waitFor(() => {
      expect(screen.getByText("Configured open state: closed")).toBeInTheDocument();
    });
  });

  it("should not observe events in production by default", () => {
    vi.stubEnv("NODE_ENV", "production");
    renderWithProviders(<ProductionObservationTestApp />);

    fireEvent.click(screen.getByRole("button", { name: "Add production blocker" }));

    expect(screen.getByText("Observed events:")).toBeInTheDocument();
  });

  it("should observe events in production when explicitly enabled", () => {
    vi.stubEnv("NODE_ENV", "production");
    renderWithProviders(<ProductionObservationTestApp showInProduction={true} />);

    fireEvent.click(screen.getByRole("button", { name: "Add production blocker" }));

    expect(screen.getByText("Observed events: production-provider-blocker")).toBeInTheDocument();
  });
});
