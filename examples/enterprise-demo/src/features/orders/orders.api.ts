import { delayApiResponse } from "@shared/api";
import { MOCK_ORDERS } from "./orders.data";
import type { Order } from "./orders.types";

export async function fetchOrders(signal?: AbortSignal): Promise<ReadonlyArray<Order>> {
  await delayApiResponse(1200, signal);
  return MOCK_ORDERS;
}
