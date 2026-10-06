import { delayApiResponse } from "@shared/api";

/** Simulated finance operation, owned and cancelled by the demo session. */
export async function refundEnterpriseOrder(signal: AbortSignal): Promise<void> {
  await delayApiResponse(350, signal);
}
