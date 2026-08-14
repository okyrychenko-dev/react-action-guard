import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../test/utils";
import EventItem from "../EventItem";
import EventItemDetails from "../EventItemDetails";
import EventItemHeader from "../EventItemHeader";
import type { DevtoolsEvent } from "../../../types";

const baseEvent: DevtoolsEvent = {
  id: "event-1",
  action: "add",
  blockerId: "blocker-1",
  timestamp: 1_000,
  config: { scope: ["a", "b"], reason: "Reason", priority: 10 },
  duration: 2_000,
};

describe("EventItemHeader", () => {
  it("should render action and blocker id", () => {
    renderWithProviders(<EventItemHeader event={baseEvent} />);

    expect(screen.getByText("add")).toBeInTheDocument();
    expect(screen.getByText("blocker-1")).toBeInTheDocument();
  });

  it("should render formatted time", () => {
    renderWithProviders(<EventItemHeader event={baseEvent} />);

    expect(screen.getByText(/\d{2}:\d{2}:\d{2}/)).toBeInTheDocument();
  });
});

describe("EventItemDetails", () => {
  it("should render scope, duration, and priority", () => {
    renderWithProviders(<EventItemDetails event={baseEvent} />);

    expect(screen.getByText("scope: a, b")).toBeInTheDocument();
    expect(screen.getByText("duration: 2.0s")).toBeInTheDocument();
    expect(screen.getByText("priority: 10")).toBeInTheDocument();
  });

  it("should render global scope when config is missing", () => {
    const event: DevtoolsEvent = { ...baseEvent, config: undefined, duration: undefined };

    renderWithProviders(<EventItemDetails event={event} />);

    expect(screen.getByText("scope: global")).toBeInTheDocument();
  });
});

describe("EventItem", () => {
  it("should select event when not selected", () => {
    const onSelect = vi.fn();

    renderWithProviders(<EventItem event={baseEvent} selected={false} onSelect={onSelect} />);

    fireEvent.click(screen.getByText("blocker-1"));

    expect(onSelect).toHaveBeenCalledWith("event-1");
  });

  it("should clear selection when already selected", () => {
    const onSelect = vi.fn();

    renderWithProviders(<EventItem event={baseEvent} selected={true} onSelect={onSelect} />);

    fireEvent.click(screen.getByText("blocker-1"));

    expect(onSelect).toHaveBeenCalledWith(null);
  });
});
