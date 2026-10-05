const CHECKOUT_OPERATION_CANCELLED_ERROR = "CheckoutOperationCancelledError";

export function createCheckoutOperationId(prefix: string): string {
  return `${prefix}-${Date.now().toString()}`;
}

export function createPaymentGatewayError(): Error {
  return new Error("Payment gateway returned a transient authorization error.");
}

export function isCheckoutOperationCancelled(error: unknown): boolean {
  return error instanceof Error && error.name === CHECKOUT_OPERATION_CANCELLED_ERROR;
}

export function waitForCheckoutOperation(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(createCancelledOperationError());
      return;
    }

    const timeoutId = window.setTimeout(resolve, ms);

    const handleAbort = (): void => {
      window.clearTimeout(timeoutId);
      reject(createCancelledOperationError());
    };

    signal.addEventListener("abort", handleAbort, { once: true });
  });
}

function createCancelledOperationError(): Error {
  const error = new Error("Checkout operation was cancelled.");
  error.name = CHECKOUT_OPERATION_CANCELLED_ERROR;
  return error;
}
