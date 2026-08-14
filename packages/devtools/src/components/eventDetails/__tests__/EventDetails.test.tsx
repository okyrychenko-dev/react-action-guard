import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../test/utils";
import EventDetails from "../EventDetails";
import EventDetailsContent from "../EventDetailsContent";
import EventDetailsHeader from "../EventDetailsHeader";
import type { DevtoolsEvent } from "../../../types";

const baseEvent: DevtoolsEvent = {
  id: "event-1",
  action: "add",
  blockerId: "blocker-1",
  timestamp: 8_000,
  duration: 1_500,
  config: {
    scope: ["global", "form"],
    reason: "Saving",
    priority: 100,
  },
  prevState: {
    scope: "form",
    reason: "Pending",
    priority: 50,
  },
};

describe("EventDetailsHeader", () => {
  it("should call onClose", () => {
    const onClose = vi.fn();

    renderWithProviders(<EventDetailsHeader action="add" onClose={onClose} />);

    fireEvent.click(screen.getByTitle("Close details"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("EventDetailsContent", () => {
  it("should render event details", () => {
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(10_000);

    renderWithProviders(<EventDetailsContent event={baseEvent} />);

    expect(screen.getByText("Blocker ID")).toBeInTheDocument();
    expect(screen.getByText("blocker-1")).toBeInTheDocument();
    expect(screen.getByText(/ago/)).toBeInTheDocument();
    expect(screen.getByText("Duration")).toBeInTheDocument();
    expect(screen.getByText("1.5s")).toBeInTheDocument();
    expect(
      screen.getByText((_, node) => node?.textContent === "scope: global, form")
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, node) => node?.textContent === "reason: Saving")
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, node) => node?.textContent === "priority: 100")
    ).toBeInTheDocument();
    expect(screen.getByText("Previous State")).toBeInTheDocument();
    expect(
      screen.getByText((_, node) => node?.textContent === "reason: Pending")
    ).toBeInTheDocument();
    expect(screen.getByText((_, node) => node?.textContent === "priority: 50")).toBeInTheDocument();

    nowSpy.mockRestore();
  });
});

describe("EventDetails", () => {
  it("should render header and content", () => {
    const onClose = vi.fn();

    renderWithProviders(<EventDetails event={baseEvent} onClose={onClose} />);

    expect(screen.getByText("Blocker ID")).toBeInTheDocument();

    fireEvent.click(screen.getByTitle("Close details"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
