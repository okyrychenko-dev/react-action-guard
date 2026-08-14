import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { devtoolsStoreApi } from "../../../store";
import { renderWithProviders } from "../../../test/utils";
import Stats from "../Stats";
import type { DevtoolsEvent } from "../../../types";

const events: Array<DevtoolsEvent> = [
  { id: "1", action: "add", blockerId: "b1", timestamp: 1, config: { scope: "checkout" } },
  {
    id: "2",
    action: "remove",
    blockerId: "b1",
    timestamp: 2,
    duration: 1_000,
    config: { scope: "checkout" },
  },
  { id: "3", action: "add", blockerId: "b2", timestamp: 3, config: { scope: "global" } },
];

describe("Stats", () => {
  beforeEach(() => {
    devtoolsStoreApi.setState({ events: [] });
  });

  it("should render an empty state when there are no events", () => {
    renderWithProviders(<Stats />);

    expect(screen.getByText("No statistics yet")).toBeInTheDocument();
  });

  it("should render aggregate sections and scope counts", () => {
    devtoolsStoreApi.setState({ events });

    renderWithProviders(<Stats />);

    expect(screen.getByText("Total events")).toBeInTheDocument();
    expect(screen.getByText("Events by action")).toBeInTheDocument();
    expect(screen.getByText("Top scopes")).toBeInTheDocument();
    expect(screen.getByText("checkout")).toBeInTheDocument();
    expect(screen.getByText("global")).toBeInTheDocument();
    // One event carries a 1000ms duration → avg and max both render as "1.0s".
    expect(screen.getAllByText("1.0s")).toHaveLength(2);
  });

  it("should show a placeholder duration when no event has a duration", () => {
    devtoolsStoreApi.setState({
      events: [{ id: "1", action: "add", blockerId: "b1", timestamp: 1 }],
    });

    renderWithProviders(<Stats />);

    expect(screen.getAllByText("—")).toHaveLength(2);
  });
});
