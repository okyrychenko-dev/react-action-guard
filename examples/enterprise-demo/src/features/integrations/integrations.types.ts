export type ChipColor = "default" | "primary" | "secondary" | "success" | "warning" | "danger";

export interface InventoryData {
  items: number;
  reserved: number;
  timestamp: number;
}

export type GatewayStatus = "ok" | "degraded" | "error";

export interface GatewayData {
  latency: number;
  status: GatewayStatus;
  checkedAt: number;
}

export interface PriceUpdateResponse {
  pushedAt: number;
  catalogVersion: string;
}

export interface OrderExportResponse {
  exportedAt: number;
  exportedCount: number;
}
