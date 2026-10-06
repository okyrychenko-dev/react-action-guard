export interface CartLine {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  riskScore: number;
}

export interface CheckoutState {
  address: string;
  paymentReference: string;
  couponCode: string;
  inventoryReserved: boolean;
  riskHold: boolean;
  isGatewaySlow: boolean;
  shouldFailNextPayment: boolean;
  hasUnsavedChanges: boolean;
  lines: ReadonlyArray<CartLine>;
}

export type CheckoutOperationStatus = "pending" | "success" | "error" | "cancelled";

export interface CheckoutOperationTimelineEntry {
  id: string;
  label: string;
  detail: string;
  status: CheckoutOperationStatus;
  timestamp: number;
}
