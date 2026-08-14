import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../test/utils";
import Badge from "../Badge";
import Content from "../Content";
import EmptyState from "../EmptyState";
import ErrorBoundary from "../ErrorBoundary";
import EventBadge from "../EventBadge";
import IconButton from "../IconButton";

function Thrower(): never {
  throw new Error("Boom");
}

describe("Shared components", () => {
  it("should render badge content", () => {
    renderWithProviders(<Badge>3</Badge>);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should render content container", () => {
    renderWithProviders(
      <Content>
        <span>Content</span>
      </Content>
    );

    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("should render empty state", () => {
    renderWithProviders(
      <EmptyState>
        <span>Empty</span>
      </EmptyState>
    );

    expect(screen.getByText("Empty")).toBeInTheDocument();
  });

  it("should render event badge with action data", () => {
    renderWithProviders(<EventBadge action="add">add</EventBadge>);

    const badge = screen.getByText("add");
    expect(badge).toHaveAttribute("data-action", "add");
  });

  it("should render icon button and handle click", () => {
    const onClick = vi.fn();

    renderWithProviders(<IconButton onClick={onClick}>X</IconButton>);

    fireEvent.click(screen.getByText("X"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should render error boundary fallback", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    renderWithProviders(
      <ErrorBoundary>
        <Thrower />
      </ErrorBoundary>
    );

    expect(screen.getByText("Devtools Error")).toBeInTheDocument();
    expect(screen.getByText("Boom")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
