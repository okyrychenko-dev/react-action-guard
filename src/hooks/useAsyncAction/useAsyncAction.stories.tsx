import { clsx } from "clsx";
import { JSX } from "react";
import {
  AffectedElements,
  DebugPanel,
  StatusDisplay,
  StoryContainer,
  formatErrorMessage,
  simulateAsyncOperation,
} from "../../storybook/components";
import { useIsBlocked } from "../useIsBlocked";
import { useAsyncAction } from "./useAsyncAction";
import type { Meta, StoryObj } from "@storybook/react-vite";
import "../../storybook/components/shared.stories.css";

interface AsyncActionDemoProps {
  actionId?: string;
  scope?: string;
  delayMs?: number;
  shouldFail?: boolean;
}

const AsyncActionDemo = ({
  actionId = "save-data",
  scope = "async-scope",
  delayMs = 2000,
  shouldFail = false,
}: AsyncActionDemoProps): JSX.Element => {
  const isBlocked = useIsBlocked(scope);

  const executeWithBlocking = useAsyncAction(actionId, scope);

  const handleSave = (): void => {
    executeWithBlocking(() => simulateAsyncOperation(delayMs, shouldFail))
      .then(() => {
        alert("Data saved successfully!");
      })
      .catch((error: unknown) => {
        alert(`Error: ${formatErrorMessage(error)}`);
      });
  };

  return (
    <StoryContainer title="useAsyncAction Demo">
      <StatusDisplay>{isBlocked ? "🔒 Saving..." : "✅ Ready"}</StatusDisplay>

      <button
        onClick={handleSave}
        disabled={isBlocked}
        className={clsx(
          "primaryButton",
          isBlocked ? "primaryButtonDisabled" : "primaryButtonEnabled"
        )}
      >
        {isBlocked ? "Saving..." : "Save Data"}
      </button>

      <AffectedElements
        isBlocked={isBlocked}
        description="These elements are disabled while the async action is running:"
      />

      <DebugPanel />
    </StoryContainer>
  );
};

const meta: Meta<typeof AsyncActionDemo> = {
  title: "Hooks/useAsyncAction",
  component: AsyncActionDemo,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Hook for wrapping async operations with automatic UI blocking. " +
          "Automatically blocks the UI while the async operation is running and unblocks when it completes or fails.",
      },
    },
  },
  argTypes: {
    actionId: {
      control: "text",
      description: "Unique identifier for the async action",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "save-data" },
      },
    },
    scope: {
      control: "text",
      description: "Scope of the blocker (can be 'global' or any custom scope)",
      table: {
        type: { summary: "string | string[]" },
        defaultValue: { summary: "async-scope" },
      },
    },
    delayMs: {
      control: "number",
      description: "Simulated async operation delay in milliseconds",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "2000" },
      },
    },
    shouldFail: {
      control: "boolean",
      description: "Simulate async operation failure",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof AsyncActionDemo>;

export const Basic: Story = {
  args: {
    actionId: "save-data",
    scope: "async-scope",
    delayMs: 2000,
    shouldFail: false,
  },
};

export const FastOperation: Story = {
  args: {
    actionId: "quick-save",
    scope: "async-scope",
    delayMs: 500,
    shouldFail: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Fast async operation with 500ms delay.",
      },
    },
  },
};

export const LongOperation: Story = {
  args: {
    actionId: "slow-save",
    scope: "async-scope",
    delayMs: 5000,
    shouldFail: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Long-running async operation with 5 second delay.",
      },
    },
  },
};

export const WithError: Story = {
  args: {
    actionId: "failing-save",
    scope: "async-scope",
    delayMs: 1500,
    shouldFail: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Async operation that fails. UI is unblocked after the error, and the error is shown to the user.",
      },
    },
  },
};

export const GlobalScope: Story = {
  args: {
    actionId: "global-save",
    scope: "global",
    delayMs: 2000,
    shouldFail: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Async operation with global scope - blocks all UI elements.",
      },
    },
  },
};
