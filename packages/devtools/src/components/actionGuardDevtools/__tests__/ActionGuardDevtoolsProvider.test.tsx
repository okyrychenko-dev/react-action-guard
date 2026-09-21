import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEVTOOLS_STORAGE_KEY, devtoolsStoreApi } from "../../../store";
import { renderWithProviders } from "../../../test/utils";
import {
  CustomObservationTestApp,
  ProductionObservationTestApp,
  SharedConfigurationTestApp,
} from "./fixtures";

describe("ActionGuardDevtoolsProvider", () => {
  beforeEach(() => {
    const store = devtoolsStoreApi.getState();

    store.clearEvents();
    store.setActiveTab("timeline");
    store.resetFilter();
    if (store.isMinimized) {
      store.toggleMinimized();
    }
    window.localStorage.clear();
    uiBlockingStoreApi.getState().clearAllBlockers();
  });

  afterEach(() => {
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
    expect(persistedPreferences).toContain('"search":"persisted custom search"');
    expect(persistedPreferences).toContain('"isMinimized":true');

    firstObservation.unmount();
    renderWithProviders(<CustomObservationTestApp />);

    expect(screen.getByText("Active preference: stats")).toBeInTheDocument();
    expect(screen.getByText("Search preference: persisted custom search")).toBeInTheDocument();
    expect(screen.getByText("Minimized preference: minimized")).toBeInTheDocument();
    expect(screen.getByText("Observed events:")).toBeInTheDocument();
    expect(screen.getByText("Configured open state: closed")).toBeInTheDocument();
    expect(screen.getByText("Configured maximum: 200")).toBeInTheDocument();
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
