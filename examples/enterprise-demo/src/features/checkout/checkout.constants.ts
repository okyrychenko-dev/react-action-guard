import type { CheckoutState } from "./checkout.types";

export const INITIAL_CHECKOUT_STATE: CheckoutState = {
  address: "204 Enterprise Way, Suite 8",
  paymentReference: "VISA ending 4242",
  couponCode: "",
  inventoryReserved: true,
  riskHold: false,
  isGatewaySlow: false,
  shouldFailNextPayment: false,
  hasUnsavedChanges: false,
  lines: [
    {
      id: "line-1",
      sku: "ENT-SEAT",
      name: "Enterprise platform seats",
      quantity: 24,
      unitPrice: 79,
      riskScore: 18,
    },
    {
      id: "line-2",
      sku: "SLA-PRIORITY",
      name: "Priority support SLA",
      quantity: 1,
      unitPrice: 950,
      riskScore: 9,
    },
    {
      id: "line-3",
      sku: "AUDIT-LOGS",
      name: "Audit log retention add-on",
      quantity: 1,
      unitPrice: 320,
      riskScore: 12,
    },
  ],
};

export const CHECKOUT_OPERATION_DELAY_MS = 450;
export const SLOW_PAYMENT_GATEWAY_DELAY_MS = 6500;
