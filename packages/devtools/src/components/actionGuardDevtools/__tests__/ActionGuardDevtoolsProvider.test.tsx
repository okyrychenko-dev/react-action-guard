import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { devtoolsStoreApi } from "../../../store";
import { renderWithProviders } from "../../../test/utils";
import {
  CustomObservationTestApp,
  ProductionObservationTestApp,
  SharedConfigurationTestApp,
} from "./fixtures";

describe("ActionGuardDevtoolsProvider", () => {
  beforeEach(() => {
    devtoolsStoreApi.getState().clearEvents();
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
