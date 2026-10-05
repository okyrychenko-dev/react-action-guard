import { delayApiResponse } from "@shared/api";
import type {
  GatewayData,
  InventoryData,
  OrderExportResponse,
  PriceUpdateResponse,
} from "./integrations.types";

export async function fetchInventorySnapshot(signal?: AbortSignal): Promise<InventoryData> {
  await delayApiResponse(1500, signal);

  return {
    items: 2847,
    reserved: 312,
    timestamp: Date.now(),
  };
}

export async function validatePaymentGateway(signal?: AbortSignal): Promise<GatewayData> {
  await delayApiResponse(1200, signal);

  return {
    latency: 42,
    status: "ok",
    checkedAt: Date.now(),
  };
}

export async function pushPriceUpdate(signal?: AbortSignal): Promise<PriceUpdateResponse> {
  await delayApiResponse(2000, signal);

  return {
    pushedAt: Date.now(),
    catalogVersion: "catalog-2026.05",
  };
}

export async function exportOrdersToErp(signal?: AbortSignal): Promise<OrderExportResponse> {
  await delayApiResponse(2500, signal);

  return {
    exportedAt: Date.now(),
    exportedCount: 3,
  };
}
