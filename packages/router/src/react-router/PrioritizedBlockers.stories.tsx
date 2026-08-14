import { useBlocker } from "@okyrychenko-dev/react-action-guard";
import clsx from "clsx";
import { ReactElement, useState } from "react";
import { useNavigationBlocker } from "../react-router";
import {
  InfoBox,
  MockRouterProvider,
  NavigationSimulator,
  StatusDisplay,
  StoryContainer,
} from "../storybook/components";
import type { Meta, StoryObj } from "@storybook/react-vite";
import "../storybook/components/shared.stories.css";

/**
 * Demonstrates multiple blockers with priorities.
 *
 * UI blocking (react-action-guard) uses priority to resolve conflicts.
 * Navigation blocking should align with the highest-priority blocker.
 */

interface BlockerConfig {
  id: string;
  label: string;
  scope: string;
  priority: number;
}

const blockers: Array<BlockerConfig> = [
  { id: "upload", label: "Upload in progress", scope: "upload", priority: 90 },
  { id: "payment", label: "Payment processing", scope: "payment", priority: 80 },
  { id: "draft", label: "Unsaved draft", scope: "draft", priority: 50 },
];

const PrioritizedBlockersDemo = (): ReactElement => {
  const [activeIds, setActiveIds] = useState<Array<string>>([]);

  // Activate blockers based on toggles
  const uploadActive = activeIds.includes("upload");
  const paymentActive = activeIds.includes("payment");
  const draftActive = activeIds.includes("draft");

  useBlocker("upload", { scope: "upload", reason: "upload active", priority: 90 }, uploadActive);
  useBlocker(
    "payment",
    { scope: "payment", reason: "payment active", priority: 80 },
    paymentActive
  );
  useBlocker("draft", { scope: "draft", reason: "draft active", priority: 50 }, draftActive);

  // Navigation blocker watches all scopes
  useNavigationBlocker({
    scope: blockers.map((b) => b.scope),
    message: "High-priority operation in progress. Leave anyway?",
    onBlock: () => {
      console.log("🚫 Navigation blocked by highest-priority scope");
    },
    onAllow: () => {
      console.log("✅ Navigation allowed (no blockers active)");
    },
  });

  const isBlocked = activeIds.length > 0;
  const highest = blockers
    .filter(({ id }) => activeIds.includes(id))
    .sort((a, b) => b.priority - a.priority)[0];
  const blockedMessage = highest
    ? `🔒 Blocking active (highest: ${highest.label} · priority ${highest.priority})`
    : "🔒 Blocking active";
  const readyMessage = "✅ Ready to navigate";

  return (
    <StoryContainer title="Multiple Blockers with Priorities">
      <InfoBox className="mb-20">
        <p>
          <strong>Priority matters:</strong> UI blockers use priority to decide which reason is
          shown. Navigation is blocked if any scope is active, but you should align your messaging
          with the highest-priority blocker.
        </p>
      </InfoBox>

      <StatusDisplay
        isBlocked={isBlocked}
        blockedMessage={blockedMessage}
        readyMessage={readyMessage}
      />

      <div className="card mt-20">
        <h3 className="card-title">Toggle blockers</h3>
        <div className="grid">
          {blockers.map(({ id, label, priority }) => {
            const isActive = activeIds.includes(id);
            return (
              <div key={id} className={clsx("card", { "animate-pulse": isActive })}>
                <div className="flex-row">
                  <strong>{label}</strong>
                  <span className="text-muted">priority {priority}</span>
                </div>
                <button
                  onClick={() => {
                    setActiveIds((prev) =>
                      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
                    );
                  }}
                  className={clsx("btn", isActive ? "btn-danger" : "btn-primary", "mt-12")}
                >
                  {isActive ? "Disable" : "Enable"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <NavigationSimulator isBlocked={isBlocked} />

      <InfoBox className="mt-20">
        <p>
          <strong>Best practice:</strong> keep navigation messaging in sync with your top-priority
          blocker. If multiple blockers are active, show the most critical reason in your custom
          dialog or banner.
        </p>
      </InfoBox>
    </StoryContainer>
  );
};

const meta: Meta<typeof PrioritizedBlockersDemo> = {
  title: "Integration/Prioritized Blockers",
  component: PrioritizedBlockersDemo,
  decorators: [
    (Story) => (
      <MockRouterProvider>
        <Story />
      </MockRouterProvider>
    ),
  ],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Demonstrates multiple blockers with priorities. UI blockers use priority to resolve which reason to show; navigation is blocked if any scope is active.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof PrioritizedBlockersDemo>;

export const MultipleBlockers: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "🧩 Multiple blockers active. Toggle them to see how navigation stays blocked while any scope is active.",
      },
    },
  },
};
