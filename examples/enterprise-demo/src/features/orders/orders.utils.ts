import { CURRENCY_FORMATTER } from "./orders.data";
import type { OrderRisk, OrderStatus } from "./orders.types";

export function formatAmount(amount: number): string {
  return CURRENCY_FORMATTER.format(amount);
}

export function getStatusChipColor(
  status: OrderStatus
): "default" | "warning" | "success" | "danger" {
  switch (status) {
    case "pending":
      return "default";
    case "processing":
      return "warning";
    case "completed":
      return "success";
    case "flagged":
      return "danger";
  }
}

export function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "processing":
      return "Processing";
    case "completed":
      return "Completed";
    case "flagged":
      return "Flagged";
  }
}

export function getRiskChipColor(risk: OrderRisk): "success" | "warning" | "danger" {
  switch (risk) {
    case "low":
      return "success";
    case "medium":
      return "warning";
    case "high":
      return "danger";
  }
}

export function getRiskLabel(risk: OrderRisk): string {
  switch (risk) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
  }
}
