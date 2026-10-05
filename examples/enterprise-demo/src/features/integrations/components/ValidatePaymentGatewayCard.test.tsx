import { useEnterpriseIsBlocked } from "@features/core";
import { AppProviders } from "@app/AppProviders";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ValidatePaymentGatewayCard } from "./ValidatePaymentGatewayCard";

function PaymentAvailability() {
  const blocked = useEnterpriseIsBlocked("payment");
  return <output>{blocked ? "Payment locked" : "Payment available"}</output>;
}

describe("ValidatePaymentGatewayCard", () => {
  afterEach(() => vi.useRealTimers());

  it("should leave a disabled query idle, block its first fetch and refetch, and release on completion", async () => {
    vi.useFakeTimers();
    render(
      <AppProviders>
        {() => (
          <>
            <ValidatePaymentGatewayCard />
            <PaymentAvailability />
          </>
        )}
      </AppProviders>
    );
    const run = screen.getByRole("button", { name: /run health check/i });
    expect(run).toBeEnabled();
    expect(screen.getByText("Unknown")).toBeInTheDocument();
    expect(screen.getByText("Payment available")).toBeInTheDocument();
    fireEvent.click(run);
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(run).toBeDisabled();
    expect(screen.getByText("Payment locked")).toBeInTheDocument();
    await act(() => vi.advanceTimersByTimeAsync(1201));
    expect(screen.getByText("Healthy")).toBeInTheDocument();
    expect(screen.getByText("Payment available")).toBeInTheDocument();
    expect(run).toBeEnabled();
    fireEvent.click(run);
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(screen.getByText("Payment locked")).toBeInTheDocument();
    expect(run).toBeDisabled();
    await act(() => vi.advanceTimersByTimeAsync(1201));
    expect(screen.getByText("Payment available")).toBeInTheDocument();
    expect(run).toBeEnabled();
  });
});
