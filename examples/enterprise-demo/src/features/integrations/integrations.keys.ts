export const integrationKeys = {
  all: ["integrations"] as const,
  inventory: () => [...integrationKeys.all, "inventory"] as const,
  inventorySnapshot: () => [...integrationKeys.inventory(), "snapshot"] as const,
  orderExport: () => [...integrationKeys.all, "order-export"] as const,
  paymentGateway: () => [...integrationKeys.all, "payment-gateway"] as const,
  paymentGatewayHealth: () => [...integrationKeys.paymentGateway(), "health"] as const,
  priceCatalog: () => [...integrationKeys.all, "price-catalog"] as const,
  priceCatalogPush: () => [...integrationKeys.priceCatalog(), "push"] as const,
} as const;
