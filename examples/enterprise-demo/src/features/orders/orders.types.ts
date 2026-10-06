export type OrderStatus = "pending" | "processing" | "completed" | "flagged";
export type OrderRisk = "low" | "medium" | "high";

export interface Order {
  id: string;
  customer: string;
  amount: number;
  status: OrderStatus;
  date: string;
  risk: OrderRisk;
}
