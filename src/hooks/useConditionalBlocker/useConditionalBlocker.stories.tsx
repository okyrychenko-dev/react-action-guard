import { clsx } from "clsx";
import { JSX, useState } from "react";
import { AffectedElements, DebugPanel, StoryContainer } from "../../storybook/components";
import { useIsBlocked } from "../useIsBlocked";
import { useConditionalBlocker } from "./useConditionalBlocker";
import type { Meta, StoryObj } from "@storybook/react-vite";
import "../../storybook/components/shared.stories.css";
import "./useConditionalBlocker.stories.css";

interface ConditionalBlockerDemoProps {
  blockerId?: string;
  scope?: string;
  reason?: string;
  threshold?: number;
  checkIntervalMs?: number;
}

const ConditionalBlockerDemo = ({
  blockerId = "condition-blocker",
  scope = "conditional-scope",
  reason = "Value exceeds threshold",
  threshold = 50,
  checkIntervalMs = 1000,
}: ConditionalBlockerDemoProps): JSX.Element => {
  const [value, setValue] = useState(0);
  const isBlocked = useIsBlocked(scope);

  useConditionalBlocker(blockerId, {
    scope,
    reason,
    condition: () => value > threshold,
    checkInterval: checkIntervalMs,
  });

  const isAboveThreshold = value > threshold;

  return (
    <StoryContainer title="useConditionalBlocker Demo">
      <div className={clsx("statusCard", isBlocked ? "statusCardBlocked" : "statusCardReady")}>
        <div className="statusRow">
          <span className="statusIcon">{isBlocked ? "🔒" : "✅"}</span>
          <div>
            <strong className="statusTitle">{isBlocked ? "Blocked" : "Ready"}</strong>
            <span className="statusSubtitle">
              {isBlocked
                ? `Value (${value.toString()}) is above threshold (${threshold.toString()})`
                : "Value is within safe range"}
            </span>
          </div>
        </div>
      </div>
      <div className="sliderCard">
        <div>
          <label className="sliderLabel">Current Value: {value}</label>

          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(e) => {
              setValue(Number(e.target.value));
            }}
            className="sliderInput"
          />

          <div className="sliderScaleRow">
            <span>0</span>
            <span
              className={clsx(
                "thresholdText",
                isAboveThreshold ? "thresholdTextExceeded" : "thresholdTextSafe"
              )}
            >
              Threshold: {threshold}
            </span>
            <span>100</span>
          </div>
        </div>

        <div className="conditionInfo">
          <strong>Condition:</strong> value &gt; {threshold}
          <br />
          <strong>Check Interval:</strong> {checkIntervalMs}ms
          <br />
          <strong>Current Status:</strong>{" "}
          <span
            className={clsx(
              "conditionStatus",
              isAboveThreshold ? "conditionStatusBlocked" : "conditionStatusAllowed"
            )}
          >
            {isAboveThreshold ? "BLOCKING" : "ALLOW"}
          </span>
        </div>
      </div>

      <AffectedElements
        isBlocked={isBlocked}
        description="These elements are disabled when the condition is met:"
      />

      <DebugPanel />
    </StoryContainer>
  );
};

const meta: Meta<typeof ConditionalBlockerDemo> = {
  title: "Hooks/useConditionalBlocker",
  component: ConditionalBlockerDemo,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Hook for conditionally blocking UI based on a dynamic condition function. " +
          "The condition is checked at regular intervals and blocking is activated/deactivated automatically. " +
          "Useful for validation rules, resource limits, or state-dependent restrictions.",
      },
    },
  },
  argTypes: {
    blockerId: {
      control: "text",
      description: "Unique identifier for the blocker",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "condition-blocker" },
      },
    },
    scope: {
      control: "text",
      description: "Scope of the blocker",
      table: {
        type: { summary: "string | string[]" },
        defaultValue: { summary: "conditional-scope" },
      },
    },
    reason: {
      control: "text",
      description: "Reason for blocking",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "Value exceeds threshold" },
      },
    },
    threshold: {
      control: "number",
      description: "Threshold value for the condition",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "50" },
      },
    },
    checkIntervalMs: {
      control: "number",
      description: "Interval to check condition (milliseconds)",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "1000" },
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ConditionalBlockerDemo>;

export const Basic: Story = {
  args: {
    blockerId: "condition-blocker",
    scope: "conditional-scope",
    reason: "Value exceeds threshold",
    threshold: 50,
    checkIntervalMs: 1000,
  },
};

export const LowThreshold: Story = {
  args: {
    blockerId: "low-threshold",
    scope: "conditional-scope",
    reason: "Value exceeds low threshold",
    threshold: 25,
    checkIntervalMs: 1000,
  },
  parameters: {
    docs: {
      description: {
        story: "Lower threshold (25) - blocks when value is greater than 25.",
      },
    },
  },
};

export const HighThreshold: Story = {
  args: {
    blockerId: "high-threshold",
    scope: "conditional-scope",
    reason: "Value exceeds high threshold",
    threshold: 75,
    checkIntervalMs: 1000,
  },
  parameters: {
    docs: {
      description: {
        story: "Higher threshold (75) - blocks only when value exceeds 75.",
      },
    },
  },
};

export const FastCheck: Story = {
  args: {
    blockerId: "fast-check",
    scope: "conditional-scope",
    reason: "Value exceeds threshold (fast checking)",
    threshold: 50,
    checkIntervalMs: 250,
  },
  parameters: {
    docs: {
      description: {
        story: "Faster check interval (250ms) for more responsive blocking.",
      },
    },
  },
};

export const SlowCheck: Story = {
  args: {
    blockerId: "slow-check",
    scope: "conditional-scope",
    reason: "Value exceeds threshold (slow checking)",
    threshold: 50,
    checkIntervalMs: 2000,
  },
  parameters: {
    docs: {
      description: {
        story: "Slower check interval (2s) for less frequent condition evaluation.",
      },
    },
  },
};
