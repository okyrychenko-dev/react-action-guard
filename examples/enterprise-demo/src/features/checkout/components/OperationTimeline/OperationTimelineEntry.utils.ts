import type { CheckoutOperationTimelineEntry } from "../../checkout.types";

export function statusColor(
  status: CheckoutOperationTimelineEntry["status"]
): "warning" | "success" | "danger" | "default" {
  switch (status) {
    case "pending":
      return "warning";
    case "success":
      return "success";
    case "error":
      return "danger";
    case "cancelled":
      return "default";
  }
}
