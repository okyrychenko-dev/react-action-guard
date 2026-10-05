import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach } from "vitest";
import { App } from "./App";
import { renderWithProviders } from "@test/renderWithProviders";

// Reset URL before each test so BrowserRouter always starts at "/"
beforeEach(() => {
  window.history.pushState({}, "", "/");
});

function renderApp() {
  return renderWithProviders(<App />);
}

function getActiveBlockers(): HTMLElement {
  return screen.getByLabelText("Active blockers");
}

async function goToPage(
  user: ReturnType<typeof userEvent.setup>,
  page: "Checkout" | "Admin"
): Promise<void> {
  const nav = screen.getByRole("navigation", { name: /main navigation/i });
  await user.click(within(nav).getByRole("button", { name: new RegExp(page, "i") }));
}

describe("Enterprise checkout demo", () => {
  it("should block checkout controls while an async action runs and then unblock", async () => {
    const user = userEvent.setup();
    renderApp();

    await goToPage(user, "Checkout");

    const saveButton = screen.getByRole("button", { name: /save cart/i });
    await user.click(saveButton);

    expect(screen.getByText("Guarded")).toBeInTheDocument();
    expect(saveButton).toBeDisabled();

    await waitFor(() => {
      expect(saveButton).not.toBeDisabled();
    });
  });

  it("should prevent duplicate checkout submits while the scope is blocked", async () => {
    const user = userEvent.setup();
    renderApp();

    await goToPage(user, "Checkout");

    const placeOrderButton = screen.getByRole("button", { name: /place order/i });
    await user.click(placeOrderButton);

    expect(placeOrderButton).toBeDisabled();

    await user.click(placeOrderButton);
    expect((await screen.findAllByText(/created order ent-/i)).length).toBeGreaterThan(0);
  });

  it("should show highest priority blockers first in the inspector", async () => {
    const user = userEvent.setup();
    renderApp();

    await goToPage(user, "Checkout");

    await user.click(screen.getByText(/risk hold/i));
    await user.click(screen.getByText(/operations lock/i));

    await waitFor(() => {
      expect(within(getActiveBlockers()).getByText("risk-review-hold")).toBeInTheDocument();
    });

    const list = getActiveBlockers();
    const risk = within(list).getByText("risk-review-hold");
    const ops = within(list).getByText("ops-manual-lock");

    expect(risk.compareDocumentPosition(ops) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("should handle confirmable admin action confirm and cancel states", async () => {
    const user = userEvent.setup();
    renderApp();

    await goToPage(user, "Admin");

    await user.click(screen.getByRole("button", { name: /refund order/i }));
    expect(screen.getByText(/approve enterprise refund/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /keep order/i }));
    expect(screen.getByText(/refund cancelled/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /refund order/i }));
    await user.click(screen.getByRole("button", { name: /approve refund/i }));

    expect(
      await screen.findByText(/refund approved and audit event recorded/i)
    ).toBeInTheDocument();
  });

  it("should activate scheduled maintenance with fake timers and then clear it", async () => {
    const user = userEvent.setup();
    renderApp();

    await goToPage(user, "Admin");

    await user.click(screen.getByText(/arm 1s maintenance window/i));

    expect(
      await within(getActiveBlockers()).findByText("scheduled-maintenance")
    ).toBeInTheDocument();

    await waitFor(
      () => {
        expect(
          within(getActiveBlockers()).queryByText("scheduled-maintenance")
        ).not.toBeInTheDocument();
      },
      { timeout: 2500 }
    );
  });

  it("should toggle conditional blockers from demo state", async () => {
    const user = userEvent.setup();
    renderApp();

    await goToPage(user, "Checkout");

    const inspector = screen.getByRole("complementary");
    const scopeButton = within(inspector)
      .getAllByRole("button", { name: /^checkout$/i })
      .at(0);

    if (scopeButton === undefined) {
      throw new Error("Blocking scope selector was not rendered.");
    }

    await user.click(scopeButton);
    await user.click(await screen.findByRole("option", { name: /inventory/i }));
    await user.click(screen.getByText(/inventory missing/i));

    await waitFor(() => {
      expect(
        within(getActiveBlockers()).getByText("inventory-reservation-missing")
      ).toBeInTheDocument();
    });

    await user.click(screen.getByText(/inventory missing/i));

    await waitFor(() => {
      expect(
        within(getActiveBlockers()).queryByText("inventory-reservation-missing")
      ).not.toBeInTheDocument();
    });
  });

  it("should record middleware audit events", async () => {
    const user = userEvent.setup();
    renderApp();

    await goToPage(user, "Checkout");

    await user.click(screen.getByRole("button", { name: /save cart/i }));

    expect((await screen.findAllByText("save-cart-1")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("add")[0]).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText("remove")[0]).toBeInTheDocument();
    });
  });
});
