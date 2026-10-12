import { act, fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@test/renderWithProviders";
import { App } from "./App";

beforeEach(() => {
  window.history.pushState({}, "", "/checkout");
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Shared user and agent workflow", () => {
  it("should protect shared edits while keeping help available and release on success", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);
    const editor = screen.getByRole("region", { name: "User and agent coordination" });
    const controls = within(editor);
    await user.click(controls.getByRole("button", { name: "Start agent edit" }));
    expect(controls.getByRole("textbox", { name: "Property value" })).toBeDisabled();
    expect(controls.getByRole("button", { name: "Save revision" })).toBeDisabled();
    expect(controls.getByRole("button", { name: "Recalculate manually" })).toBeDisabled();
    await user.click(controls.getByRole("button", { name: "Help and chat" }));
    expect(controls.getByText(/Read-only help remains available/)).toBeVisible();
    expect(controls.getByRole("status")).toHaveTextContent(
      "Agent is editing property and recalculating revision"
    );
    await user.click(controls.getByRole("button", { name: "Complete operation" }));
    expect(controls.getByRole("textbox", { name: "Property value" })).toHaveValue("Agent proposal");
    expect(controls.getByRole("textbox", { name: "Property value" })).toBeEnabled();
    expect(controls.getByRole("button", { name: "Save revision" })).toBeEnabled();
    expect(controls.getByText("Revision: 2")).toBeVisible();
  });

  it("should expose store-local Devtools with explicit action mappings", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);
    expect(screen.getByText(/Open package Devtools/)).toBeVisible();
    await user.click(screen.getByTitle("Open Action Guard Devtools"));
    await user.click(screen.getByRole("button", { name: /Active.*Blockers/i }));
    expect(screen.getByRole("table", { name: "Scope protection" })).toHaveTextContent(
      "recalculate-revision"
    );
  });
  it("should autosave changed checkout fields and release navigation protection", async () => {
    vi.useFakeTimers();
    renderWithProviders(<App />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Autosave checkout" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Shipping address" }), {
      target: { value: "Autosaved address" },
    });
    expect(screen.getByText("Navigation blocked")).toBeVisible();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(799);
    });
    expect(screen.getByRole("button", { name: "Save cart" })).toBeEnabled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(screen.getByRole("button", { name: "Save cart" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Payment reference" })).toBeDisabled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(650);
    });
    expect(screen.getByText("Navigation open")).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Shipping address" })).toHaveValue(
      "Autosaved address"
    );
  });

  it("should postpone autosave during a checkout hold and cancel a disabled debounce", async () => {
    vi.useFakeTimers();
    renderWithProviders(<App />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Autosave checkout" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Shipping address" }), {
      target: { value: "Deferred address" },
    });
    fireEvent.click(screen.getByRole("switch", { name: "Risk hold" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(screen.getByText("Navigation blocked")).toBeVisible();
    fireEvent.click(screen.getByRole("switch", { name: "Risk hold" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(799);
    });
    expect(screen.getByRole("button", { name: "Save cart" })).toBeEnabled();
    fireEvent.click(screen.getByRole("checkbox", { name: "Autosave checkout" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(screen.getByText("Navigation blocked")).toBeVisible();
    expect(screen.getByRole("button", { name: "Save cart" })).toBeEnabled();
    fireEvent.click(screen.getByRole("checkbox", { name: "Autosave checkout" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1250);
    });
    expect(screen.getByText("Navigation open")).toBeVisible();
  });

  it.each(["Fail operation", "Cancel operation"])(
    "should release failed or cancelled proposals through %s",
    async (label) => {
      const user = userEvent.setup();
      renderWithProviders(<App />);
      const controls = within(screen.getByRole("region", { name: "User and agent coordination" }));
      await user.click(controls.getByRole("button", { name: "Start agent edit" }));
      await user.click(controls.getByRole("button", { name: label }));
      expect(controls.getByRole("textbox", { name: "Property value" })).toHaveValue(
        "Original property"
      );
      expect(controls.getByRole("button", { name: "Save revision" })).toBeEnabled();
      expect(controls.getByText("Revision: 1")).toBeVisible();
      await user.click(controls.getByRole("button", { name: "Recalculate manually" }));
      expect(controls.getByRole("button", { name: "Start agent edit" })).toBeDisabled();
      await user.click(controls.getByRole("button", { name: "Complete operation" }));
      expect(controls.getByText("Revision: 2")).toBeVisible();
      await user.click(controls.getByRole("button", { name: "Save revision" }));
      expect(controls.getByText("Saved revision: 2")).toBeVisible();
    }
  );

  it("should discard pending proposals on reset and route unmount", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);
    await user.click(screen.getByRole("button", { name: "Start agent edit" }));
    await user.click(screen.getByRole("button", { name: "Reset demo" }));
    expect(screen.getByRole("textbox", { name: "Property value" })).toHaveValue(
      "Original property"
    );
    expect(screen.getByRole("button", { name: "Complete operation" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Start agent edit" }));
    await user.click(
      within(screen.getByRole("navigation", { name: "Main navigation" })).getByRole("button", {
        name: /^Admin/i,
      })
    );
    await user.click(
      within(screen.getByRole("navigation", { name: "Main navigation" })).getByRole("button", {
        name: /^Checkout/i,
      })
    );
    expect(screen.getByRole("button", { name: "Start agent edit" })).toBeEnabled();
    expect(screen.getByRole("textbox", { name: "Property value" })).toHaveValue(
      "Original property"
    );
  });
});
