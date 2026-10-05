import { act, render, screen } from "@testing-library/react";
import { ConfirmationRoute } from "@test/ConfirmationRoute";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppProviders } from "./AppProviders";

describe("Navigation dialog settlement", () => {
  it("should ignore an old resolver after replacement and a current resolver after unmount", async () => {
    const resolvers: Array<(confirmed: boolean) => void> = [];
    const router = createMemoryRouter(
      [
        {
          path: "/checkout",
          element: (
            <ConfirmationRoute
              onResolver={(resolve) => {
                resolvers.push(resolve);
              }}
            />
          ),
        },
        { path: "/admin", element: <p>Admin destination</p> },
        { path: "/orders", element: <p>Orders destination</p> },
      ],
      { initialEntries: ["/checkout"] }
    );
    const { unmount } = render(
      <AppProviders>{() => <RouterProvider router={router} />}</AppProviders>
    );
    await act(async () => {
      void router.navigate("/admin");
    });
    const old = resolvers.at(-1);
    expect(old).toBeDefined();
    await act(async () => {
      void router.navigate("/orders");
    });
    await act(async () => {
      old?.(true);
    });
    expect(router.state.location.pathname).toBe("/checkout");
    expect(screen.getByRole("dialog", { name: "Navigation blocked" })).toBeInTheDocument();
    const current = resolvers.at(-1);
    expect(current).not.toBe(old);
    unmount();
    await act(async () => {
      current?.(true);
    });
    expect(router.state.location.pathname).toBe("/checkout");
    router.dispose();
  });
});
