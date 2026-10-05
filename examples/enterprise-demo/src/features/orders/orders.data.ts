import type { Order } from "./orders.types";

export const MOCK_ORDERS: ReadonlyArray<Order> = [
  {
    id: "ENT-10042",
    customer: "Acme Corp",
    amount: 12480,
    status: "flagged",
    date: "2026-05-09",
    risk: "high",
  },
  {
    id: "ENT-10041",
    customer: "Global Tech",
    amount: 3200,
    status: "processing",
    date: "2026-05-09",
    risk: "low",
  },
  {
    id: "ENT-10040",
    customer: "MegaRetail",
    amount: 7650,
    status: "pending",
    date: "2026-05-08",
    risk: "medium",
  },
  {
    id: "ENT-10039",
    customer: "StartupXYZ",
    amount: 980,
    status: "completed",
    date: "2026-05-08",
    risk: "low",
  },
  {
    id: "ENT-10038",
    customer: "EnterpriseCo",
    amount: 45200,
    status: "completed",
    date: "2026-05-07",
    risk: "low",
  },
  {
    id: "ENT-10037",
    customer: "TechGiant Inc",
    amount: 8900,
    status: "flagged",
    date: "2026-05-07",
    risk: "high",
  },
  {
    id: "ENT-10036",
    customer: "CloudSystems",
    amount: 2100,
    status: "completed",
    date: "2026-05-06",
    risk: "low",
  },
  {
    id: "ENT-10035",
    customer: "DataFlow Ltd",
    amount: 15600,
    status: "processing",
    date: "2026-05-06",
    risk: "medium",
  },
];

export const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
