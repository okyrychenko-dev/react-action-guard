import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@test/renderWithProviders";
import { routes } from "./routes";

describe("Checkout navigation", () => {
  it("should retain the actual location on cancel and navigate on confirmation", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter([...routes], { initialEntries: ["/checkout"] });
    renderWithProviders(<RouterProvider router={router} />);
    await user.type(screen.getByRole("textbox", { name: /shipping address/i }), " updated");
    const navigation = screen.getByRole("navigation", { name: /main navigation/i });
    await user.click(within(navigation).getByRole("button", { name: /^admin/i }));
    expect(await screen.findByRole("dialog", { name: "Navigation blocked" })).toBeVisible();
    expect(router.state.location.pathname).toBe("/checkout");
    await user.click(screen.getByRole("button", { name: "Stay and save" }));
    expect(router.state.location.pathname).toBe("/checkout");
    await user.click(within(navigation).getByRole("button", { name: /^admin/i }));
    await user.click(await screen.findByRole("button", { name: "Leave anyway" }));
    expect(router.state.location.pathname).toBe("/admin");
    router.dispose();
  });
  it("should allow saving after cancelling navigation and then leave without confirmation", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter([...routes], { initialEntries: ["/checkout"] });
    renderWithProviders(<RouterProvider router={router} />);
    await user.type(screen.getByRole("textbox", { name: /shipping address/i }), " update");
    const admin = within(screen.getByRole("navigation")).getByRole("button", { name: /^admin/i });
    await user.click(admin);
    await user.click(await screen.findByRole("button", { name: "Stay and save" }));
    const save = screen.getByRole("button", { name: "Save cart" });
    expect(save).toBeEnabled();
    await user.click(save);
    await waitFor(() => expect(save).toBeEnabled());
    await user.click(
      within(screen.getByRole("navigation")).getByRole("button", { name: /^admin/i })
    );
    expect(router.state.location.pathname).toBe("/admin");
    expect(screen.queryByRole("dialog", { name: "Navigation blocked" })).not.toBeInTheDocument();
    router.dispose();
  });

  it("should settle an unmounted checkout dialog without navigating to its pending destination", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter([...routes], { initialEntries: ["/checkout"] });
    const { unmount } = renderWithProviders(<RouterProvider router={router} />);
    await user.type(screen.getByRole("textbox", { name: /shipping address/i }), " update");
    await user.click(
      within(screen.getByRole("navigation")).getByRole("button", { name: /^admin/i })
    );
    await screen.findByRole("dialog", { name: "Navigation blocked" });
    unmount();
    await act(() => Promise.resolve());
    expect(router.state.location.pathname).toBe("/checkout");
    router.dispose();
  });
});
