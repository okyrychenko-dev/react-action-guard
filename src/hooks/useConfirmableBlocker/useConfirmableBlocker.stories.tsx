import { clsx } from "clsx";
import { JSX, useState } from "react";
import {
  DebugPanel,
  StatusDisplay,
  StoryContainer,
  formatErrorMessage,
  simulateAsyncOperation,
} from "../../storybook/components";
import { useIsBlocked } from "../useIsBlocked";
import { useConfirmableBlocker } from "./useConfirmableBlocker";
import type { Meta, StoryObj } from "@storybook/react-vite";
import "../../storybook/components/shared.stories.css";
import "./useConfirmableBlocker.stories.css";

interface ConfirmableBlockerDemoProps {
  blockerId?: string;
  scope?: string;
  confirmMessage?: string;
  confirmTitle?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  delayMs?: number;
  shouldFail?: boolean;
}

const ConfirmableBlockerDemo = ({
  blockerId = "delete-action",
  scope = "confirmable-scope",
  confirmMessage = "Are you sure you want to delete this item?",
  confirmTitle = "Confirm Delete",
  confirmButtonText = "Delete",
  cancelButtonText = "Cancel",
  delayMs = 1500,
  shouldFail = false,
}: ConfirmableBlockerDemoProps): JSX.Element => {
  const [message, setMessage] = useState<string>("");
  const isBlocked = useIsBlocked(scope);

  const { execute, isDialogOpen, isExecuting, confirmConfig, onConfirm, onCancel } =
    useConfirmableBlocker(blockerId, {
      scope,
      confirmMessage,
      confirmTitle,
      confirmButtonText,
      cancelButtonText,
      onConfirm: async () => {
        await simulateAsyncOperation(delayMs, shouldFail);

        if (!shouldFail) {
          setMessage("✅ Item deleted successfully!");
        }
      },
      onCancel: () => {
        setMessage("❌ Delete cancelled");
      },
    });

  const handleExecute = (): void => {
    setMessage("");
    execute();
  };

  const handleConfirm = (): void => {
    onConfirm().catch((error: unknown) => {
      setMessage(`❌ Error: ${formatErrorMessage(error)}`);
    });
  };
  const isSuccess = message.includes("✅");
  const isError = message.includes("❌");

  return (
    <StoryContainer title="useConfirmableBlocker Demo">
      <StatusDisplay>
        {isExecuting ? "🔄 Executing..." : isBlocked ? "🔒 Blocked" : "✅ Ready"}
      </StatusDisplay>

      <button
        onClick={handleExecute}
        disabled={isBlocked}
        className={clsx("primaryButton", { primaryButtonDisabled: isBlocked })}
      >
        Delete Item
      </button>

      {message && (
        <div className={clsx("messageBox", { messageSuccess: isSuccess, messageError: isError })}>
          {message}
        </div>
      )}

      {/* Confirmation Dialog */}
      {isDialogOpen && (
        <div className="dialogOverlay">
          <div className="dialog">
            <h3 className="dialogTitle">{confirmConfig.title}</h3>
            <p className="dialogMessage">{confirmConfig.message}</p>

            <div className="dialogActions">
              <button onClick={onCancel} className="cancelButton">
                {confirmConfig.cancelText}
              </button>
              <button onClick={handleConfirm} className="confirmButton">
                {confirmConfig.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isExecuting && (
        <div className="loadingOverlay">
          <div className="loadingContent">
            <div className="spinner" />
            <span>Processing...</span>
          </div>
        </div>
      )}

      <DebugPanel />
    </StoryContainer>
  );
};

const meta: Meta<typeof ConfirmableBlockerDemo> = {
  title: "Hooks/useConfirmableBlocker",
  component: ConfirmableBlockerDemo,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Hook for creating confirmable actions with a two-step confirmation dialog. " +
          "Blocks the UI both during the confirmation dialog and during the async operation execution.",
      },
    },
  },
  argTypes: {
    blockerId: {
      control: "text",
      description: "Unique identifier for the blocker",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "delete-action" },
      },
    },
    scope: {
      control: "text",
      description: "Scope of the blocker",
      table: {
        type: { summary: "string | string[]" },
        defaultValue: { summary: "confirmable-scope" },
      },
    },
    confirmMessage: {
      control: "text",
      description: "Message displayed in the confirmation dialog",
      table: {
        type: { summary: "string" },
        defaultValue: {
          summary: "Are you sure you want to delete this item?",
        },
      },
    },
    confirmTitle: {
      control: "text",
      description: "Title of the confirmation dialog",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "Confirm Delete" },
      },
    },
    confirmButtonText: {
      control: "text",
      description: "Text for the confirm button",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "Delete" },
      },
    },
    cancelButtonText: {
      control: "text",
      description: "Text for the cancel button",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "Cancel" },
      },
    },
    delayMs: {
      control: "number",
      description: "Simulated operation delay in milliseconds",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "1500" },
      },
    },
    shouldFail: {
      control: "boolean",
      description: "Simulate operation failure",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ConfirmableBlockerDemo>;

export const Basic: Story = {
  args: {
    blockerId: "delete-action",
    scope: "confirmable-scope",
    confirmMessage: "Are you sure you want to delete this item?",
    confirmTitle: "Confirm Delete",
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    delayMs: 1500,
    shouldFail: false,
  },
};

export const CustomLabels: Story = {
  args: {
    blockerId: "save-action",
    scope: "confirmable-scope",
    confirmMessage: "Do you want to save these changes?",
    confirmTitle: "Save Changes",
    confirmButtonText: "Yes, Save",
    cancelButtonText: "No, Discard",
    delayMs: 1000,
    shouldFail: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Confirmation dialog with custom button labels and title.",
      },
    },
  },
};

export const LongOperation: Story = {
  args: {
    blockerId: "export-action",
    scope: "confirmable-scope",
    confirmMessage: "This will export all data. This may take a while. Continue?",
    confirmTitle: "Export Data",
    confirmButtonText: "Export",
    cancelButtonText: "Cancel",
    delayMs: 4000,
    shouldFail: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Long-running operation with 4 second delay showing loading state.",
      },
    },
  },
};

export const WithError: Story = {
  args: {
    blockerId: "failing-delete",
    scope: "confirmable-scope",
    confirmMessage: "Delete this item? (This will fail)",
    confirmTitle: "Confirm Delete",
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    delayMs: 1000,
    shouldFail: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Demonstrates error handling when the confirmed operation fails.",
      },
    },
  },
};

export const FastConfirmation: Story = {
  args: {
    blockerId: "quick-action",
    scope: "confirmable-scope",
    confirmMessage: "Proceed with this action?",
    confirmTitle: "Quick Action",
    confirmButtonText: "Yes",
    cancelButtonText: "No",
    delayMs: 300,
    shouldFail: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Fast confirmation with minimal delay for quick operations.",
      },
    },
  },
};
