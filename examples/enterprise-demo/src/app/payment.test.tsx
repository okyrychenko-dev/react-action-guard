import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@test/renderWithProviders";
import { StrictMode } from "react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { routes } from "./routes";

describe("Checkout payment workflow", () => {
  it("should consume a simulated failure and complete an explicit retry in Strict Mode", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter([...routes], { initialEntries: ["/checkout"] });
    renderWithProviders(
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>
    );
    await user.click(screen.getByRole("switch", { name: "Fail next payment" }));
    await user.click(screen.getByRole("button", { name: "Place order" }));
    expect(
      await screen.findByText("Payment gateway returned a transient authorization error.")
    ).toBeInTheDocument();
    const retry = screen.getByRole("button", { name: "Retry order" });
    expect(retry).toBeEnabled();
    await user.click(retry);
    expect(await screen.findAllByText(/created order ENT-/i)).toHaveLength(2);
    expect(
      screen.queryByText("Payment gateway returned a transient authorization error.")
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Place order" })).toBeEnabled();
    router.dispose();
  });
});
