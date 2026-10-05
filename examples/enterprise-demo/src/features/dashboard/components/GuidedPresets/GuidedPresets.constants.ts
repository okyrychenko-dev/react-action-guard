import type { GuidedPreset } from "../../hooks/useGuidedPresets";

export const GUIDED_PRESETS: ReadonlyArray<GuidedPreset> = [
  {
    id: "high-risk-checkout",
    label: "High-risk checkout",
    description: "Risk, payment, and inventory controls are all blocking the order path.",
    blockers: [
      {
        id: "preset-high-risk-review",
        config: {
          scope: ["checkout", "payment"],
          reason: "High-risk checkout requires manual review before payment capture",
          priority: 95,
        },
      },
      {
        id: "preset-inventory-reservation",
        config: {
          scope: "inventory",
          reason: "Inventory reservation has not been confirmed",
          priority: 86,
        },
      },
    ],
  },
  {
    id: "maintenance-window",
    label: "Maintenance window",
    description: "Global operations are paused while scheduled maintenance is active.",
    blockers: [
      {
        id: "preset-maintenance-window",
        config: {
          scope: ["global", "checkout", "admin", "navigation"],
          reason: "Maintenance window is active across enterprise workflows",
          priority: 90,
          timeout: 12000,
        },
      },
    ],
  },
  {
    id: "concurrent-team-review",
    label: "Concurrent team review",
    description: "A teammate is editing checkout-sensitive records in parallel.",
    blockers: [
      {
        id: "preset-team-review",
        config: {
          scope: ["checkout", "admin"],
          reason: "Concurrent team review is holding shared enterprise records",
          priority: 78,
        },
      },
    ],
  },
  {
    id: "payment-gateway-incident",
    label: "Payment gateway incident",
    description: "Payment calls are degraded and checkout should not submit orders.",
    blockers: [
      {
        id: "preset-payment-gateway-incident",
        config: {
          scope: ["payment", "checkout"],
          reason: "Payment gateway incident is suppressing checkout submissions",
          priority: 93,
        },
      },
    ],
  },
];

export const GUIDED_PRESET_IDS = GUIDED_PRESETS.flatMap((preset) =>
  preset.blockers.map((blocker) => blocker.id)
);
