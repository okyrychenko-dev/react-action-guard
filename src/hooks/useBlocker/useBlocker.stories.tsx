import { clsx } from "clsx";
import { JSX, useState } from "react";
import {
  AffectedElements,
  DebugPanel,
  StatusDisplay,
  StoryContainer,
} from "../../storybook/components";
import { useIsBlocked } from "../useIsBlocked";
import { useBlocker } from "./useBlocker";
import type { Meta, StoryObj } from "@storybook/react-vite";
import "../../storybook/components/shared.stories.css";
import "./useBlocker.stories.css";
interface BlockerDemoProps {
  blockerId?: string;
  scope?: string;
  reason?: string;
  priority?: number;
  initialActive?: boolean;
}

const BlockerDemo = ({
  blockerId = "demo-blocker",
  scope = "demo-scope",
  reason = "Demo blocking in progress",
  priority = 20,
  initialActive = false,
}: BlockerDemoProps): JSX.Element => {
  const [isActive, setIsActive] = useState(initialActive);
  const isBlocked = useIsBlocked(scope);

  useBlocker(blockerId, { scope, reason, priority }, isActive);

  const handleToggle = (): void => {
    setIsActive((prev) => !prev);
  };

  return (
    <StoryContainer title="useBlocker Demo">
      <StatusDisplay>{isBlocked ? "🔒 Blocked" : "🔓 Not Blocked"}</StatusDisplay>

      <button
        onClick={handleToggle}
        className={clsx("toggleButton", isActive ? "toggleButtonActive" : "toggleButtonInactive")}
      >
        {isActive ? "Deactivate" : "Activate"} Blocker
      </button>

      <AffectedElements isBlocked={isBlocked} />

      <DebugPanel />
    </StoryContainer>
  );
};

const meta: Meta<typeof BlockerDemo> = {
  title: "Hooks/useBlocker",
  component: BlockerDemo,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Basic hook for managing UI blocking with manual control. " +
          "The blocker is active only when the `isActive` parameter is true.",
      },
    },
  },
  argTypes: {
    blockerId: {
      control: "text",
      description: "Unique identifier for the blocker",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "demo-blocker" },
      },
    },
    scope: {
      control: "text",
      description: "Scope of the blocker (can be 'global' or any custom scope)",
      table: {
        type: { summary: "string | string[]" },
        defaultValue: { summary: "demo-scope" },
      },
    },
    reason: {
      control: "text",
      description: "Human-readable reason for blocking",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "Demo blocking in progress" },
      },
    },
    priority: {
      control: "number",
      description: "Priority level (0-100, higher = more important)",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "50" },
      },
    },
    initialActive: {
      control: "boolean",
      description: "Initial active state of the blocker",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof BlockerDemo>;

export const Basic: Story = {
  args: {
    blockerId: "demo-blocker",
    scope: "demo-scope",
    reason: "Demo blocking in progress",
    priority: 20,
    initialActive: false,
  },
};

export const GlobalScope: Story = {
  args: {
    blockerId: "global-blocker",
    scope: "global",
    reason: "Global blocking active",
    priority: 50,
    initialActive: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Blocker with global scope affects all UI elements regardless of their scope.",
      },
    },
  },
};

export const HighPriority: Story = {
  args: {
    blockerId: "high-priority-blocker",
    scope: "critical-operations",
    reason: "Critical operation in progress",
    priority: 90,
    initialActive: false,
  },
  parameters: {
    docs: {
      description: {
        story: "High priority blocker (90) takes precedence over lower priority blockers.",
      },
    },
  },
};

export const InitiallyActive: Story = {
  args: {
    blockerId: "initially-active",
    scope: "demo-scope",
    reason: "Blocker active by default",
    priority: 50,
    initialActive: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Blocker that starts in an active state.",
      },
    },
  },
};
