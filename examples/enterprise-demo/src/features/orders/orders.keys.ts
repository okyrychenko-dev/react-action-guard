export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: () => [...orderKeys.lists(), "all"] as const,
  exports: () => [...orderKeys.all, "exports"] as const,
  exportToErp: () => [...orderKeys.exports(), "erp"] as const,
} as const;
