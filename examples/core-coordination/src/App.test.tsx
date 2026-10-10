import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("core coordination example", () => {
  it("should protect two independent consumers while keeping help available and release on success", async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(screen.getByRole("textbox", { name: "Display name" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Open dashboard" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Save profile" }));

    expect(screen.getByRole("textbox", { name: "Display name" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Open dashboard" })).toBeDisabled();
    expect(
      within(screen.getByRole("region", { name: "Profile editor" })).getByText(
        "Executing save-profile"
      )
    ).toBeVisible();
    expect(
      within(screen.getByRole("region", { name: "Navigation" })).getByText("Executing save-profile")
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Show help" }));

    expect(screen.getByText("Help stays available while your profile saves.")).toBeVisible();
    expect(await screen.findByText("Profile saved.", {}, { timeout: 2500 })).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Display name" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Open dashboard" })).toBeEnabled();
    expect(screen.queryAllByText("Executing save-profile")).toHaveLength(0);
  });

  it("should release both consumers after failure and allow a successful retry", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole("checkbox", { name: "Simulate save failure" }));
    await user.click(screen.getByRole("button", { name: "Save profile" }));

    expect(screen.getByRole("textbox", { name: "Display name" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Open dashboard" })).toBeDisabled();
    expect(await screen.findByRole("alert", {}, { timeout: 2500 })).toHaveTextContent(
      "Save failed. Try again."
    );
    expect(screen.getByRole("textbox", { name: "Display name" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Open dashboard" })).toBeEnabled();
    expect(screen.queryAllByText("Executing save-profile")).toHaveLength(0);

    await user.click(screen.getByRole("checkbox", { name: "Simulate save failure" }));
    await user.click(screen.getByRole("button", { name: "Save profile" }));

    expect(await screen.findByText("Profile saved.", {}, { timeout: 2500 })).toBeVisible();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("should retain protection after hiding the producer until its work settles", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole("button", { name: "Save profile" }));
    await user.click(screen.getByRole("checkbox", { name: "Show save controls" }));

    expect(screen.queryByRole("button", { name: "Save profile" })).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Display name" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Open dashboard" })).toBeDisabled();

    await waitFor(
      () => {
        expect(screen.getByRole("textbox", { name: "Display name" })).toBeEnabled();
        expect(screen.getByRole("button", { name: "Open dashboard" })).toBeEnabled();
      },
      { timeout: 2500 }
    );

    expect(screen.queryAllByText("Executing save-profile")).toHaveLength(0);
    await user.click(screen.getByRole("button", { name: "Open dashboard" }));
    expect(screen.getByText("Dashboard opened")).toBeVisible();
  });
});
