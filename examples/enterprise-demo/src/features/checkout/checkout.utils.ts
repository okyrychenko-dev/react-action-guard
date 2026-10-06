import type { CartLine } from "./checkout.types";

export function calculateSubtotal(lines: ReadonlyArray<CartLine>): number {
  return lines.reduce((total, line) => total + line.quantity * line.unitPrice, 0);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
