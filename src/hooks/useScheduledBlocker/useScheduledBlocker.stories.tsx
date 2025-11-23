import { clsx } from "clsx";
import { JSX, useEffect, useState } from "react";
import { AffectedElements, DebugPanel, StoryContainer } from "../../storybook/components";
import { useIsBlocked } from "../useIsBlocked";
import { useScheduledBlocker } from "./useScheduledBlocker";
import type { Meta, StoryObj } from "@storybook/react-vite";
import "../../storybook/components/shared.stories.css";
import "./useScheduledBlocker.stories.css";

interface ScheduledBlockerDemoProps {
  blockerId?: string;
  scope?: string;
  reason?: string;
  delaySeconds?: number;
  durationSeconds?: number;
}

const ScheduledBlockerDemo = ({
  blockerId = "scheduled-maintenance",
  scope = "scheduled-scope",
  reason = "Scheduled maintenance in progress",
  delaySeconds = 3,
  durationSeconds = 5,
}: ScheduledBlockerDemoProps): JSX.Element => {
  const [baseTime] = useState(() => Date.now());
  const scheduledTime = baseTime + delaySeconds * 1000;
  const [countdown, setCountdown] = useState<number>(0);
  const [scheduleStarted, setScheduleStarted] = useState(false);
  const [scheduleEnded, setScheduleEnded] = useState(false);

  const isBlocked = useIsBlocked(scope);

  useEffect(() => {
    if (!scheduledTime) {
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = scheduledTime - now;

      if (diff > 0) {
        setCountdown(Math.ceil(diff / 1000));
      } else {
        setCountdown(0);
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [scheduledTime]);

  useScheduledBlocker(blockerId, {
    scope,
    reason,
    schedule: {
      start: scheduledTime,
      duration: durationSeconds * 1000,
    },
    onScheduleStart: () => {
      setScheduleStarted(true);
      setScheduleEnded(false);
    },
    onScheduleEnd: () => {
      setScheduleEnded(true);
    },
  });

  return (
    <StoryContainer title="useScheduledBlocker Demo">
      <div className={clsx("statusCard", isBlocked ? "statusCardBlocked" : "statusCardReady")}>
        <div className="statusRow">
          <span className="statusIcon">{isBlocked ? "🔒" : "✅"}</span>
          <div>
            <strong className="statusTitle">
              {isBlocked ? "Blocked" : scheduleEnded ? "Completed" : "Ready"}
            </strong>
            <span className="statusSubtitle">
              {countdown > 0
                ? `Blocking starts in ${countdown.toString()}s`
                : isBlocked
                  ? "Blocking active"
                  : scheduleEnded
                    ? "Schedule completed"
                    : "Waiting..."}
            </span>
          </div>
        </div>
      </div>

      <div className="scheduleInfo">
        <h3 className="scheduleTitle">Schedule Info</h3>
        <div className="scheduleDetails">
          <div>Start: in {delaySeconds}s from now</div>
          <div>Duration: {durationSeconds}s</div>
          <div>
            Started: {scheduleStarted ? "✅ Yes" : "❌ No"} | Ended:{" "}
            {scheduleEnded ? "✅ Yes" : "❌ No"}
          </div>
        </div>
      </div>

      <AffectedElements
        isBlocked={isBlocked}
        description="These elements will be disabled during the scheduled blocking period:"
      />

      <DebugPanel />
    </StoryContainer>
  );
};

const meta: Meta<typeof ScheduledBlockerDemo> = {
  title: "Hooks/useScheduledBlocker",
  component: ScheduledBlockerDemo,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Hook for scheduling UI blocking at specific times or with duration. " +
          "Automatically activates and deactivates blocking based on the schedule. " +
          "Useful for scheduled maintenance, time-limited operations, or timed restrictions.",
      },
    },
  },
  argTypes: {
    blockerId: {
      control: "text",
      description: "Unique identifier for the blocker",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "scheduled-maintenance" },
      },
    },
    scope: {
      control: "text",
      description: "Scope of the blocker",
      table: {
        type: { summary: "string | string[]" },
        defaultValue: { summary: "scheduled-scope" },
      },
    },
    reason: {
      control: "text",
      description: "Reason for blocking",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "Scheduled maintenance in progress" },
      },
    },
    delaySeconds: {
      control: "number",
      description: "Delay before blocking starts (in seconds)",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "3" },
      },
    },
    durationSeconds: {
      control: "number",
      description: "Duration of blocking (in seconds)",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "5" },
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ScheduledBlockerDemo>;

export const Basic: Story = {
  args: {
    blockerId: "scheduled-maintenance",
    scope: "scheduled-scope",
    reason: "Scheduled maintenance in progress",
    delaySeconds: 3,
    durationSeconds: 5,
  },
};

export const ShortDelay: Story = {
  args: {
    blockerId: "quick-block",
    scope: "scheduled-scope",
    reason: "Quick scheduled block",
    delaySeconds: 2,
    durationSeconds: 3,
  },
  parameters: {
    docs: {
      description: {
        story: "Short delay (2s) and short duration (3s) for quick demonstration.",
      },
    },
  },
};

export const LongDuration: Story = {
  args: {
    blockerId: "long-maintenance",
    scope: "scheduled-scope",
    reason: "Extended maintenance window",
    delaySeconds: 2,
    durationSeconds: 10,
  },
  parameters: {
    docs: {
      description: {
        story: "Longer duration (10s) to simulate extended maintenance periods.",
      },
    },
  },
};

export const ImmediateStart: Story = {
  args: {
    blockerId: "immediate-block",
    scope: "scheduled-scope",
    reason: "Immediate blocking",
    delaySeconds: 0,
    durationSeconds: 5,
  },
  parameters: {
    docs: {
      description: {
        story: "Blocking starts immediately with no delay.",
      },
    },
  },
};

export const UpdateWindow: Story = {
  args: {
    blockerId: "update-window",
    scope: "scheduled-scope",
    reason: "System update in progress - please wait",
    delaySeconds: 3,
    durationSeconds: 8,
  },
  parameters: {
    docs: {
      description: {
        story: "Simulates a system update window with custom messaging.",
      },
    },
  },
};
